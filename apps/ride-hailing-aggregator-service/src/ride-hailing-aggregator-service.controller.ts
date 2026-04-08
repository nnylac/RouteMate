import { Controller, Post, Body, Query } from '@nestjs/common';
import { RideHailingAggregatorServiceService } from './ride-hailing-aggregator-service.service';

@Controller('ridehail')
export class RideHailingAggregatorServiceController {
  constructor(
    private readonly rideHailingAggregatorServiceService: RideHailingAggregatorServiceService,
  ) {}

  @Post('quotes')
  async getQuotes(
    @Body() body: { origin: string; destination: string },
    @Query('sortBy') sortBy: 'price' | 'eta' = 'price', // Default to cheapest
  ) {
    return this.rideHailingAggregatorServiceService.getQuotes(
      body.origin,
      body.destination,
      sortBy,
    );
  }
}
