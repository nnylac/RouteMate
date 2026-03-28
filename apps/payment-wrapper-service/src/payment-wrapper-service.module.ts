import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentWrapperServiceController } from './payment-wrapper-service.controller';
import { PaymentWrapperServiceService } from './payment-wrapper-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/payment-wrapper-service/.env',
    }),
  ],
  controllers: [PaymentWrapperServiceController],
  providers: [PaymentWrapperServiceService],
})
export class PaymentWrapperServiceModule {}
