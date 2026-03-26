import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios'; // Add this
import { RideHailingWrapperServiceController } from './ride-hailing-wrapper-service.controller';
import { RideHailingWrapperServiceService } from './ride-hailing-wrapper-service.service';

@Module({
  imports: [
    HttpModule, // Add this here
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
  controllers: [RideHailingWrapperServiceController],
  providers: [RideHailingWrapperServiceService],
})
export class RideHailingWrapperServiceModule {}
