import { Controller, Get } from '@nestjs/common';
import { RideHailingAggregatorServiceService } from './ride-hailing-aggregator-service.service';

@Controller()
export class RideHailingAggregatorServiceController {
  constructor(private readonly rideHailingAggregatorServiceService: RideHailingAggregatorServiceService) {}

  @Get()
  getHello(): string {
    return this.rideHailingAggregatorServiceService.getHello();
  }
}
