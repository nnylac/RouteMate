import { Module } from '@nestjs/common';
import { FareComparisonServiceController } from './fare-comparison-service.controller';
import { FareComparisonServiceService } from './fare-comparison-service.service';

@Module({
  imports: [],
  controllers: [FareComparisonServiceController],
  providers: [FareComparisonServiceService],
})
export class FareComparisonServiceModule {}
