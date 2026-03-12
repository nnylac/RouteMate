import { Module } from '@nestjs/common';
import { FareServiceController } from './fare-service.controller';
import { FareServiceService } from './fare-service.service';

@Module({
  imports: [],
  controllers: [FareServiceController],
  providers: [FareServiceService],
})
export class FareServiceModule {}
