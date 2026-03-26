import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RideHailingWrapperServiceController } from './ride-hailing-wrapper-service.controller';
import { RideHailingWrapperServiceService } from './ride-hailing-wrapper-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
    }),
  ],
  controllers: [RideHailingWrapperServiceController],
  providers: [RideHailingWrapperServiceService],
})
export class RideHailingWrapperServiceModule {}
