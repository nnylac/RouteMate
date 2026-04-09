import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentWrapperServiceController } from './payment-wrapper-service.controller';
import { PaymentWrapperServiceService } from './payment-wrapper-service.service';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.join(process.cwd(), 'apps', 'payment-wrapper-service', '.env'),
        path.join(process.cwd(), '.env'),
      ],
    }),
  ],
  controllers: [PaymentWrapperServiceController],
  providers: [PaymentWrapperServiceService],
})
export class PaymentWrapperServiceModule {}
