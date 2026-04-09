import { Controller, Post, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RideHailingAggregatorServiceService } from './ride-hailing-aggregator-service.service';
import { GetQuotesDto } from './dto/get-quotes.dto';

@ApiTags('Ride-Hailing Aggregator')
@Controller('ridehail')
export class RideHailingAggregatorServiceController {
  constructor(
    private readonly rideHailingAggregatorServiceService: RideHailingAggregatorServiceService,
  ) {}

  @Post('quotes')
  @ApiOperation({ summary: 'Get ride-hailing quotes from all providers' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price', 'eta'],
    description:
      'Sort results by price (cheapest first) or eta (fastest first)',
    example: 'price',
  })
  @ApiBody({
    type: GetQuotesDto,
    examples: {
      example1: {
        summary: 'SMU to Changi Airport',
        value: { origin: 'SMU', destination: 'Changi Airport' },
      },
      example2: {
        summary: 'Woodlands to SMU',
        value: { origin: 'Woodlands', destination: 'SMU' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Quotes retrieved and sorted successfully',
    schema: {
      example: {
        metadata: {
          totalOptions: 3,
          cheapestProvider: 'Tada',
          fastestProvider: 'Grab',
        },
        quotes: [
          {
            provider: 'Tada',
            price: 24.5,
            eta: 18,
            route: 'SMU → Changi Airport',
            bookingLink: 'https://tada.fake/ride3',
          },
          {
            provider: 'Gojek',
            price: 26.0,
            eta: 15,
            route: 'SMU → Changi Airport',
            bookingLink: 'https://gojek.fake/ride2',
          },
          {
            provider: 'Grab',
            price: 28.5,
            eta: 12,
            route: 'SMU → Changi Airport',
            bookingLink: 'https://grab.fake/ride1',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'No quotes available (all providers failed)',
    schema: { example: { metadata: null, quotes: [] } },
  })
  async getQuotes(
    @Body() body: GetQuotesDto,
    @Query('sortBy') sortBy: 'price' | 'eta' = 'price',
  ) {
    return this.rideHailingAggregatorServiceService.getQuotes(
      body.origin,
      body.destination,
      sortBy,
    );
  }
}
