import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { FareComparisonServiceController } from './fare-comparison-service.controller';
import { FareComparisonServiceService } from './fare-comparison-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/fare-comparison-service/.env',
    }),
    HttpModule,
  ],
  controllers: [FareComparisonServiceController],
  providers: [FareComparisonServiceService],
})
export class FareComparisonServiceModule {}
