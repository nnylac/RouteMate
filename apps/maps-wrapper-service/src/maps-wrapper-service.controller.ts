import { Controller, Get, Query } from '@nestjs/common';
import { MapsWrapperService } from './maps-wrapper-service.service';

@Controller('maps')
export class MapsWrapperServiceController {
  constructor(private readonly mapsWrapperService: MapsWrapperService) {}

  @Get('routes')
  async getRoutes(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return this.mapsWrapperService.getRoutes(origin, destination);
  }
}
