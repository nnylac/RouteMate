import { Controller, Get } from '@nestjs/common';
import { FareComparisonServiceService } from './fare-comparison-service.service';

@Controller()
export class FareComparisonServiceController {
  constructor(private readonly fareComparisonServiceService: FareComparisonServiceService) {}

  @Get()
  getHello(): string {
    return this.fareComparisonServiceService.getHello();
  }
}
