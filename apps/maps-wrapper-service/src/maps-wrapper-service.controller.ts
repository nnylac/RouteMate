import { Controller, Get, Query } from '@nestjs/common';
import { MapsWrapperServiceService } from './maps-wrapper-service.service';

@Controller('maps')
export class MapsWrapperServiceController {
  constructor(
    private readonly mapsWrapperServiceService: MapsWrapperServiceService,
  ) {}

  @Get('routes')
  async getRoutes(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return this.mapsWrapperServiceService.getRoutes(origin, destination);
  }
}
