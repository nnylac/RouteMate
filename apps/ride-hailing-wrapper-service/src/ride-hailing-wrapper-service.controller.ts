import { Controller, Get, Query } from '@nestjs/common';
import { RideHailingWrapperServiceService } from './ride-hailing-wrapper-service.service';

@Controller()
export class RideHailingWrapperServiceController {
  constructor(private readonly service: RideHailingWrapperServiceService) {}

  @Get('grab/quotes')
  getGrab(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return this.service.getGrabQuote(origin, destination);
  }

  @Get('gojek/quotes')
  getGojek(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return this.service.getGojekQuote(origin, destination);
  }

  @Get('tada/quotes')
  getTada(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return this.service.getTadaQuote(origin, destination);
  }
}
