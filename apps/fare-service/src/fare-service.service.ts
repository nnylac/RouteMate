import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PtFareRule } from './entities/pt-fare-rule.entity';

@Injectable()
export class FareService {
  constructor(
    @InjectRepository(PtFareRule)
    private readonly ptFareRuleRepository: Repository<PtFareRule>,
  ) {}

  async createTestFareRule(): Promise<PtFareRule> {
    const fareRule = this.ptFareRuleRepository.create({
      transportMode: 'trunk_bus',
      fareCategory: 'adult_card',
      applicableTime: null,
      distanceFromKm: '0.00',
      distanceToKm: '3.20',
      fareAmount: '128.00',
    });

    return this.ptFareRuleRepository.save(fareRule);
  }

  async getAllFareRules(): Promise<PtFareRule[]> {
    return this.ptFareRuleRepository.find();
  }
}
