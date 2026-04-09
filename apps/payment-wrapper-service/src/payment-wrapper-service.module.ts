import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentWrapperServiceController } from './payment-wrapper-service.controller';
import { PaymentWrapperService } from './payment-wrapper-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  controllers: [PaymentWrapperServiceController],
  providers: [PaymentWrapperService],
})
export class PaymentWrapperServiceModule {}
