import { Controller, Get } from '@nestjs/common';
import { ArrivalTimingServiceService } from './arrival-timing-service.service';

@Controller()
export class ArrivalTimingServiceController {
  constructor(private readonly arrivalTimingServiceService: ArrivalTimingServiceService) {}

  @Get()
  getHello(): string {
    return this.arrivalTimingServiceService.getHello();
  }
}
