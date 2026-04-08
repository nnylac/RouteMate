import { Body, Controller, Get, Post } from '@nestjs/common';
import { FareService } from './fare-service.service';
import { PtFareRule } from './entities/pt-fare-rule.entity';
import { CalculateFareDto } from './dto/calculate-fare.dto';

@Controller('fare-service')
export class FareServiceController {
  constructor(private readonly fareService: FareService) {}

  @Get()
  getHello(): string {
    return 'fare service is running';
  }

  @Get('rules')
  async getAllFareRules(): Promise<PtFareRule[]> {
    return this.fareService.getAllFareRules();
  }

  @Post('import/trunk-bus')
  async importTrunkBusCsv(): Promise<PtFareRule[]> {
    return this.fareService.importTrunkBusCsv();
  }

  @Post('import/mrt-lrt')
  async importMrtLrtCsv(): Promise<PtFareRule[]> {
    return this.fareService.importMrtLrtCsv();
  }

  @Post('calculate')
  async calculateFare(@Body() dto: CalculateFareDto) {
    return this.fareService.calculateFare(dto);
  }
}
