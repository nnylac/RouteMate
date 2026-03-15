import { Module } from '@nestjs/common';
import { RideHailingAggregatorServiceController } from './ride-hailing-aggregator-service.controller';
import { RideHailingAggregatorServiceService } from './ride-hailing-aggregator-service.service';

@Module({
  imports: [],
  controllers: [RideHailingAggregatorServiceController],
  providers: [RideHailingAggregatorServiceService],
})
export class RideHailingAggregatorServiceModule {}
