import { Module } from '@nestjs/common';
import { MapsWrapperServiceController } from './maps-wrapper-service.controller';
import { MapsWrapperServiceService } from './maps-wrapper-service.service';

@Module({
  imports: [],
  controllers: [MapsWrapperServiceController],
  providers: [MapsWrapperServiceService],
})
export class MapsWrapperServiceModule {}
