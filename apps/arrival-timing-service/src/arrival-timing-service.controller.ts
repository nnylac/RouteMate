import { Controller, Get, Query } from '@nestjs/common';
import { ArrivalTimingServiceService } from './arrival-timing-service.service';

@Controller('arrival-timing')
export class ArrivalTimingServiceController {
  constructor(private readonly arrivalTimingServiceService: ArrivalTimingServiceService) {}

  @Get()
  getArrivalTiming(
    @Query('line') line: string,
    @Query('stop') stop: string,
  ) {
    return this.arrivalTimingServiceService.getArrivalTiming(line, stop);
  }
}