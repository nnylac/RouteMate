import { Controller, Get } from '@nestjs/common';
import { MapsWrapperServiceService } from './maps-wrapper-service.service';

@Controller()
export class MapsWrapperServiceController {
  constructor(private readonly mapsWrapperServiceService: MapsWrapperServiceService) {}

  @Get()
  getHello(): string {
    return this.mapsWrapperServiceService.getHello();
  }
}
