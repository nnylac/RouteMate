import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FareComparisonServiceService } from './fare-comparison-service.service';
import { CompareFareDto } from './dto/compare-fare.dto';

@ApiTags('Fare Comparison Service')
@Controller('fare')
export class FareComparisonServiceController {
  constructor(
    private readonly fareComparisonServiceService: FareComparisonServiceService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Service is running',
    schema: { example: { status: 'ok', service: 'fare-comparison-service' } },
  })
  health(): object {
    return { status: 'ok', service: 'fare-comparison-service' };
  }

  @Post('compare')
  @ApiOperation({
    summary: 'Compare public transport vs ride-hailing fares for a group',
  })
  @ApiBody({
    type: CompareFareDto,
    examples: {
      solo: {
        summary: 'Solo traveller adult card',
        value: {
          route_id: 1,
          group_size: 1,
          fare_category: 'adult_card',
          sort_by: 'price',
        },
      },
      group: {
        summary: 'Group of 4 splitting ride-hailing',
        value: {
          route_id: 1,
          group_size: 4,
          fare_category: 'adult_card',
          sort_by: 'price',
        },
      },
      student: {
        summary: 'Student fare sorted by ETA',
        value: {
          route_id: 1,
          group_size: 1,
          fare_category: 'student_card',
          sort_by: 'eta',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Fare comparison result',
    schema: {
      example: {
        route_id: 1,
        origin: 'SMU',
        destination: 'Changi Airport',
        group_size: 4,
        fare_category: 'adult_card',
        public_transport: {
          mode: 'MRT',
          total_duration_mins: 45,
          total_distance_km: 18.2,
          transfer_count: 1,
          fare_per_person: 2.1,
          fare_breakdown: [
            {
              segment_id: 1,
              mode: 'MRT',
              from_stop: 'City Hall',
              to_stop: 'Changi Airport',
              fare: 2.1,
            },
          ],
          segments_priced: 1,
          segments_skipped: 1,
        },
        ride_hailing: {
          metadata: {
            totalOptions: 3,
            cheapestProvider: 'Tada',
            fastestProvider: 'Grab',
          },
          quotes: [
            { provider: 'Tada', price: 24.5, eta: 18, price_per_person: 6.13 },
            { provider: 'Gojek', price: 26.0, eta: 15, price_per_person: 6.5 },
            { provider: 'Grab', price: 28.5, eta: 12, price_per_person: 7.13 },
          ],
          group_size_note: 'Cost split across 4 people (ride cost ÷ 4)',
        },
        filters: {
          cheapest: { mode: 'public_transport', provider: 'PT', price: 2.1 },
          fastest: {
            mode: 'ride_hailing',
            provider: 'Grab',
            duration_mins: 12,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found in cache',
    schema: {
      example: {
        message: 'Route 1 not found in route-cache-service',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Route has no options stored',
    schema: {
      example: {
        message: 'Route 1 has no route options stored',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async compareFares(@Body() dto: CompareFareDto): Promise<object> {
    return this.fareComparisonServiceService.compareFares(dto);
  }
}
