import { Controller, Get } from '@nestjs/common';
import { RideHailingWrapperServiceService } from './ride-hailing-wrapper-service.service';

@Controller()
export class RideHailingWrapperServiceController {
  constructor(private readonly rideHailingWrapperServiceService: RideHailingWrapperServiceService) {}

  @Get()
  getHello(): string {
    return this.rideHailingWrapperServiceService.getHello();
  }
}
