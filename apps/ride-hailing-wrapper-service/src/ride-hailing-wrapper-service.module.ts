import { Module } from '@nestjs/common';
import { RideHailingWrapperServiceController } from './ride-hailing-wrapper-service.controller';
import { RideHailingWrapperServiceService } from './ride-hailing-wrapper-service.service';

@Module({
  imports: [],
  controllers: [RideHailingWrapperServiceController],
  providers: [RideHailingWrapperServiceService],
})
export class RideHailingWrapperServiceModule {}
