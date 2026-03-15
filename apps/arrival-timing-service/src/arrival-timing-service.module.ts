import { Module } from '@nestjs/common';
import { ArrivalTimingServiceController } from './arrival-timing-service.controller';
import { ArrivalTimingServiceService } from './arrival-timing-service.service';

@Module({
  imports: [],
  controllers: [ArrivalTimingServiceController],
  providers: [ArrivalTimingServiceService],
})
export class ArrivalTimingServiceModule {}
