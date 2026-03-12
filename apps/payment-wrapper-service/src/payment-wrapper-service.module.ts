import { Module } from '@nestjs/common';
import { PaymentWrapperServiceController } from './payment-wrapper-service.controller';
import { PaymentWrapperServiceService } from './payment-wrapper-service.service';

@Module({
  imports: [],
  controllers: [PaymentWrapperServiceController],
  providers: [PaymentWrapperServiceService],
})
export class PaymentWrapperServiceModule {}
