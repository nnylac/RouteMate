import { Controller, Get } from '@nestjs/common';
import { FareServiceService } from './fare-service.service';

@Controller()
export class FareServiceController {
  constructor(private readonly fareServiceService: FareServiceService) {}

  @Get()
  getHello(): string {
    return this.fareServiceService.getHello();
  }
}
