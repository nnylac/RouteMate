import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PtFareRule } from './entities/pt-fare-rule.entity';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { CalculateFareDto } from './dto/calculate-fare.dto';

type CsvRow = Record<string, string>;

@Injectable()
export class FareService {
  constructor(
    @InjectRepository(PtFareRule)
    private readonly ptFareRuleRepository: Repository<PtFareRule>,
  ) {}

  async importTrunkBusCsv(): Promise<PtFareRule[]> {
    try {
      const filePath = path.join(
        process.cwd(),
        'apps',
        'fare-service',
        'data',
        'trunk-bus.csv',
      );

      const rawRows = await this.readCsv(filePath);

      if (!rawRows.length) {
        throw new BadRequestException('trunk-bus.csv is empty');
      }

      await this.ptFareRuleRepository.delete({ transportMode: 'trunk_bus' });

      const fareRules: PtFareRule[] = [];

      for (const row of rawRows) {
        const { fromKm, toKm } = this.parseDistanceRange(row.distance);

        const mappings = [
          {
            fareCategory: 'adult_card',
            fareAmount: row.adult_card_fare_per_ride,
          },
          {
            fareCategory: 'adult_cash',
            fareAmount: row.adult_cash_fare_per_ride,
          },
          {
            fareCategory: 'senior_card',
            fareAmount: row.senior_citizen_card_fare_per_ride,
          },
          {
            fareCategory: 'senior_cash',
            fareAmount: row.senior_citizen_cash_fare_per_ride,
          },
          {
            fareCategory: 'student_card',
            fareAmount: row.student_card_fare_per_ride,
          },
          {
            fareCategory: 'student_cash',
            fareAmount: row.student_cash_fare_per_ride,
          },
          {
            fareCategory: 'workfare_card',
            fareAmount: row.workfare_transport_concession_card_fare_per_ride,
          },
          {
            fareCategory: 'workfare_cash',
            fareAmount: row.workfare_transport_concession_cash_fare_per_ride,
          },
          {
            fareCategory: 'pwd_card',
            fareAmount: row.persons_with_disabilities_card_fare_per_ride,
          },
          {
            fareCategory: 'pwd_cash',
            fareAmount: row.persons_with_disabilities_cash_fare_per_ride,
          },
        ];

        for (const mapping of mappings) {
          fareRules.push(
            this.ptFareRuleRepository.create({
              transportMode: 'trunk_bus',
              fareCategory: mapping.fareCategory,
              applicableTime: 'all_day',
              distanceFromKm: fromKm,
              distanceToKm: toKm,
              fareAmount: this.centsToDollars(mapping.fareAmount),
            }),
          );
        }
      }

      return await this.ptFareRuleRepository.save(fareRules);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to import trunk bus CSV: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async importMrtLrtCsv(): Promise<PtFareRule[]> {
    try {
      const filePath = path.join(
        process.cwd(),
        'apps',
        'fare-service',
        'data',
        'mrt-lrt.csv',
      );
      const rawRows = await this.readCsv(filePath);

      if (!rawRows.length) {
        throw new BadRequestException('mrt-lrt.csv is empty');
      }

      await this.ptFareRuleRepository.delete({ transportMode: 'mrt_lrt' });

      const fareRules = rawRows.map((row) => {
        const { fromKm, toKm } = this.parseDistanceRange(row.distance);

        return this.ptFareRuleRepository.create({
          transportMode: 'mrt_lrt',
          fareCategory: this.normalizeFareCategory(row.fare_type),
          applicableTime: row.applicable_time
            ? this.normalizeText(row.applicable_time)
            : null,
          distanceFromKm: fromKm,
          distanceToKm: toKm,
          fareAmount: this.centsToDollars(row.fare_per_ride),
        });
      });

      return await this.ptFareRuleRepository.save(fareRules);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException(
        `Failed to import MRT/LRT CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private readCsv(filePath: string): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const results: CsvRow[] = [];

      const stream = fs.createReadStream(filePath);

      stream.on('error', (error: Error) => reject(error));

      stream
        .pipe(csv())
        .on('data', (data: CsvRow) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error: Error) => reject(error));
    });
  }

  private normalizeText(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private parseDistanceRange(distanceText: string): {
    fromKm: string;
    toKm: string;
  } {
    const trimmed = distanceText.trim();

    if (trimmed.startsWith('Up to ')) {
      const match = trimmed.match(/Up to\s+(\d+(\.\d+)?)\s*km/i);
      if (!match) {
        throw new Error(`Invalid distance range: ${distanceText}`);
      }

      return {
        fromKm: '0.00',
        toKm: Number(match[1]).toFixed(2),
      };
    }

    const rangeMatch = trimmed.match(
      /(\d+(\.\d+)?)\s*km\s*-\s*(\d+(\.\d+)?)\s*km/i,
    );

    if (rangeMatch) {
      return {
        fromKm: Number(rangeMatch[1]).toFixed(2),
        toKm: Number(rangeMatch[3]).toFixed(2),
      };
    }

    const overMatch = trimmed.match(/Over\s+(\d+(\.\d+)?)\s*km/i);

    if (overMatch) {
      return {
        fromKm: Number(overMatch[1]).toFixed(2),
        toKm: '999.99',
      };
    }

    throw new BadRequestException(`Invalid distance range: ${distanceText}`);
  }

  private centsToDollars(value: string): string {
    return (Number(value) / 100).toFixed(2);
  }

  private normalizeFareCategory(fareType: string): string {
    const normalized = fareType.trim().toLowerCase();

    if (normalized === 'adult card fare') return 'adult_card';
    if (normalized === 'adult cash fare') return 'adult_cash';
    if (normalized === 'senior citizen card fare') return 'senior_card';
    if (normalized === 'senior citizen cash fare') return 'senior_cash';
    if (normalized === 'student card fare') return 'student_card';
    if (normalized === 'student cash fare') return 'student_cash';
    if (normalized === 'workfare transport concession card fare')
      return 'workfare_card';
    if (normalized === 'workfare transport concession cash fare')
      return 'workfare_cash';
    if (normalized === 'persons with disabilities card fare') return 'pwd_card';
    if (normalized === 'persons with disabilities cash fare') return 'pwd_cash';

    return normalized.replace(/\s+/g, '_');
  }

  async createTestFareRule(): Promise<PtFareRule> {
    const fareRule = this.ptFareRuleRepository.create({
      transportMode: 'trunk_bus',
      fareCategory: 'adult_card',
      applicableTime: 'all_day',
      distanceFromKm: '0.00',
      distanceToKm: '3.20',
      fareAmount: '1.28',
    });

    return this.ptFareRuleRepository.save(fareRule);
  }

  async getAllFareRules(): Promise<PtFareRule[]> {
    return this.ptFareRuleRepository.find();
  }

  async calculateFare(dto: CalculateFareDto): Promise<PtFareRule | null> {
    const distance = dto.distanceKm.toFixed(2);

    const query = this.ptFareRuleRepository
      .createQueryBuilder('rule')
      .where('rule.transportMode = :transportMode', {
        transportMode: dto.transportMode,
      })
      .andWhere('rule.fareCategory = :fareCategory', {
        fareCategory: dto.fareCategory,
      })
      .andWhere(':distance >= rule.distanceFromKm', { distance })
      .andWhere(':distance <= rule.distanceToKm', { distance });

    if (dto.applicableTime) {
      query.andWhere(
        '(rule.applicableTime = :applicableTime OR rule.applicableTime IS NULL)',
        { applicableTime: dto.applicableTime },
      );
    }

    const fareRule = await query.getOne();

    if (!fareRule) {
      throw new NotFoundException(
        `No fare rule found for transportMode=${dto.transportMode}, fareCategory=${dto.fareCategory}, distanceKm=${dto.distanceKm}`,
      );
    }

    return fareRule;
  }
}
