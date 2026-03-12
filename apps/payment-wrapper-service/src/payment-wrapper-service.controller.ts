import { Controller, Get } from '@nestjs/common';
import { PaymentWrapperServiceService } from './payment-wrapper-service.service';

@Controller()
export class PaymentWrapperServiceController {
  constructor(private readonly paymentWrapperServiceService: PaymentWrapperServiceService) {}

  @Get()
  getHello(): string {
    return this.paymentWrapperServiceService.getHello();
  }
}
