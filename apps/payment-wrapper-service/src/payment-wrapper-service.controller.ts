import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentWrapperServiceService } from './payment-wrapper-service.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreateRefundDto } from './dto/create-refund.dto';

@Controller('payment')
export class PaymentWrapperServiceController {
  constructor(
    private readonly paymentWrapperServiceService: PaymentWrapperServiceService,
  ) {}

  // POST /payment/intent
  @Post('intent')
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentWrapperServiceService.createPaymentIntent(dto);
  }

  // POST /payment/confirm
  @Post('confirm')
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentWrapperServiceService.confirmPayment(dto);
  }

  // POST /payment/refund
  @Post('refund')
  async createRefund(@Body() dto: CreateRefundDto) {
    return this.paymentWrapperServiceService.createRefund(dto);
  }

  // GET /payment/intent/:id
  @Get('intent/:id')
  async getPaymentIntent(@Param('id') id: string) {
    return this.paymentWrapperServiceService.getPaymentIntent(id);
  }

  // GET /payment/health
  @Get('health')
  health() {
    return { status: 'ok', service: 'payment-wrapper-service' };
  }
}
