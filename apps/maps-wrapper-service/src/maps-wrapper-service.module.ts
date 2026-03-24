import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MapsWrapperServiceController } from './maps-wrapper-service.controller';
import { MapsWrapperServiceService } from './maps-wrapper-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [MapsWrapperServiceController],
  providers: [MapsWrapperServiceService],
})
export class MapsWrapperServiceModule {}
