import { Controller, Get, Query } from '@nestjs/common';
import { RideHailingWrapperServiceService } from './ride-hailing-wrapper-service.service';

@Controller()
export class RideHailingWrapperServiceController {
  constructor(private readonly service: RideHailingWrapperServiceService) {}

  @Get('grab/quotes')
  async getGrab(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return await this.service.getGrabQuote(origin, destination);
  }

  @Get('gojek/quotes')
  async getGojek(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return await this.service.getGojekQuote(origin, destination);
  }

  @Get('tada/quotes')
  async getTada(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return await this.service.getTadaQuote(origin, destination);
  }
}
