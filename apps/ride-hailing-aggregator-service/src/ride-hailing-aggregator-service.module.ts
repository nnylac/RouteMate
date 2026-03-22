import { Module } from '@nestjs/common';
import { RideHailingAggregatorServiceController } from './ride-hailing-aggregator-service.controller';
import { RideHailingAggregatorServiceService } from './ride-hailing-aggregator-service.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [RideHailingAggregatorServiceController],
  providers: [RideHailingAggregatorServiceService],
})
export class RideHailingAggregatorServiceModule {}
