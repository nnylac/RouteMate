import { Body, Controller, Get, Post } from '@nestjs/common';
import { FareComparisonServiceService } from './fare-comparison-service.service';
import { CompareFareDto } from './dto/compare-fare.dto';

@Controller('fare')
export class FareComparisonServiceController {
  constructor(
    private readonly fareComparisonServiceService: FareComparisonServiceService,
  ) {}

  // GET /fare/health
  @Get('health')
  health(): object {
    return { status: 'ok', service: 'fare-comparison-service' };
  }

  // POST /fare/compare
  // Body: { route_id, group_size, fare_category?, sort_by? }
  // Returns a side-by-side PT vs ride-hailing comparison table
  @Post('compare')
  async compareFares(@Body() dto: CompareFareDto): Promise<object> {
    return this.fareComparisonServiceService.compareFares(dto);
  }
}
