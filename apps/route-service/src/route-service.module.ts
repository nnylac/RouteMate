import { Module } from '@nestjs/common';
import { RouteServiceController } from './route-service.controller';
import { RouteServiceService } from './route-service.service';

@Module({
  imports: [],
  controllers: [RouteServiceController],
  providers: [RouteServiceService],
})
export class RouteServiceModule {}
