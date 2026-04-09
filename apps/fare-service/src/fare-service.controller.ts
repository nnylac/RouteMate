import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FareService } from './fare-service.service';
import { PtFareRule } from './entities/pt-fare-rule.entity';
import { CalculateFareDto } from './dto/calculate-fare.dto';

@ApiTags('Fare Service')
@Controller('fare-service')
export class FareServiceController {
  constructor(private readonly fareService: FareService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Fare service is running',
    schema: { example: 'fare service is running' },
  })
  getHello(): string {
    return 'fare service is running';
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all fare rules' })
  @ApiResponse({
    status: 200,
    description: 'List of all PT fare rules',
    schema: {
      example: [
        {
          id: 1,
          transportMode: 'trunk_bus',
          fareCategory: 'adult_card',
          minDistanceKm: 0,
          maxDistanceKm: 3.2,
          fareAmount: 1.09,
        },
      ],
    },
  })
  async getAllFareRules(): Promise<PtFareRule[]> {
    return this.fareService.getAllFareRules();
  }

  @Post('import/trunk-bus')
  @ApiOperation({ summary: 'Import trunk bus fare rules from CSV' })
  @ApiResponse({
    status: 201,
    description: 'Trunk bus fare rules imported successfully',
    schema: {
      example: [
        {
          id: 1,
          transportMode: 'trunk_bus',
          fareCategory: 'adult_card',
          minDistanceKm: 0,
          maxDistanceKm: 3.2,
          fareAmount: 1.09,
        },
      ],
    },
  })
  async importTrunkBusCsv(): Promise<PtFareRule[]> {
    return this.fareService.importTrunkBusCsv();
  }

  @Post('import/mrt-lrt')
  @ApiOperation({ summary: 'Import MRT/LRT fare rules from CSV' })
  @ApiResponse({
    status: 201,
    description: 'MRT/LRT fare rules imported successfully',
    schema: {
      example: [
        {
          id: 2,
          transportMode: 'mrt_lrt',
          fareCategory: 'adult_card',
          minDistanceKm: 0,
          maxDistanceKm: 3.2,
          fareAmount: 1.19,
        },
      ],
    },
  })
  async importMrtLrtCsv(): Promise<PtFareRule[]> {
    return this.fareService.importMrtLrtCsv();
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate fare for a journey segment' })
  @ApiBody({
    type: CalculateFareDto,
    examples: {
      trunkBus: {
        summary: 'Trunk bus adult fare',
        value: {
          transportMode: 'trunk_bus',
          fareCategory: 'adult_card',
          distanceKm: 5.2,
        },
      },
      mrtStudent: {
        summary: 'MRT student fare',
        value: {
          transportMode: 'mrt_lrt',
          fareCategory: 'student_card',
          distanceKm: 8.5,
        },
      },
      senior: {
        summary: 'Senior citizen fare',
        value: {
          transportMode: 'trunk_bus',
          fareCategory: 'senior_card',
          distanceKm: 3.1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Fare calculated successfully',
    schema: {
      example: {
        transportMode: 'trunk_bus',
        fareCategory: 'adult_card',
        distanceKm: 5.2,
        fareAmount: 1.51,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No fare rule found for given parameters',
    schema: {
      example: {
        message: 'No fare rule found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async calculateFare(@Body() dto: CalculateFareDto) {
    return this.fareService.calculateFare(dto);
  }
}
