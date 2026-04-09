import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentWrapperServiceService } from './payment-wrapper-service.service';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';
import { CreateRefundDto } from '../dto/create-refund.dto';

@ApiTags('Payment Wrapper Service')
@Controller('payment')
export class PaymentWrapperServiceController {
  constructor(
    private readonly paymentWrapperServiceService: PaymentWrapperServiceService,
  ) {}

  @Post('intent')
  @ApiOperation({ summary: 'Create a Stripe payment intent for card top-up' })
  @ApiBody({
    type: CreatePaymentIntentDto,
    examples: {
      topUp20: {
        summary: 'Top up $20 SGD',
        value: {
          amount: 20.0,
          currency: 'sgd',
          metadata: { userId: 'user123', cardId: '6614a2f3c9b1234567890abc' },
        },
      },
      topUp50: {
        summary: 'Top up $50 SGD',
        value: { amount: 50.0, currency: 'sgd' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
    schema: {
      example: {
        id: 'pi_stripe123',
        client_secret: 'pi_stripe123_secret_abc',
        amount: 2000,
        currency: 'sgd',
        status: 'requires_payment_method',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid amount or currency',
    schema: {
      example: {
        message: 'amount must not be less than 0.01',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentWrapperServiceService.createPaymentIntent(dto);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm a Stripe payment intent' })
  @ApiBody({
    type: ConfirmPaymentDto,
    examples: {
      success: {
        summary: 'Confirm with successful test card',
        value: {
          paymentIntentId: 'pi_stripe123',
          paymentMethod: 'pm_card_visa',
        },
      },
      declined: {
        summary: 'Confirm with declined test card',
        value: {
          paymentIntentId: 'pi_stripe123',
          paymentMethod: 'pm_card_visa_chargeDeclined',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment confirmed successfully',
    schema: {
      example: {
        id: 'pi_stripe123',
        status: 'succeeded',
        amount: 2000,
        currency: 'sgd',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Payment declined or invalid intent',
    schema: {
      example: {
        message: 'Payment declined',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentWrapperServiceService.confirmPayment(dto);
  }

  @Post('refund')
  @ApiOperation({
    summary: 'Create a refund for a payment intent — used in rollback flow',
  })
  @ApiBody({
    type: CreateRefundDto,
    examples: {
      fullRefund: {
        summary: 'Full refund',
        value: { paymentIntentId: 'pi_stripe123' },
      },
      partialRefund: {
        summary: 'Partial refund of $10',
        value: { paymentIntentId: 'pi_stripe123', amount: 10.0 },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Refund created successfully',
    schema: {
      example: {
        id: 're_refund123',
        amount: 2000,
        currency: 'sgd',
        status: 'succeeded',
        paymentIntent: 'pi_stripe123',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid refund amount or payment intent',
    schema: {
      example: {
        message: 'Refund amount exceeds payment amount',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async createRefund(@Body() dto: CreateRefundDto) {
    return this.paymentWrapperServiceService.createRefund(dto);
  }

  @Get('intent/:id')
  @ApiOperation({ summary: 'Get a payment intent by Stripe ID' })
  @ApiParam({
    name: 'id',
    description: 'Stripe PaymentIntent ID',
    example: 'pi_stripe123',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment intent found',
    schema: {
      example: {
        id: 'pi_stripe123',
        amount: 2000,
        currency: 'sgd',
        status: 'succeeded',
        metadata: { userId: 'user123', cardId: '6614a2f3c9b1234567890abc' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Payment intent not found',
    schema: {
      example: {
        message: 'No such payment_intent',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async getPaymentIntent(@Param('id') id: string) {
    return this.paymentWrapperServiceService.getPaymentIntent(id);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Service is running',
    schema: { example: { status: 'ok', service: 'payment-wrapper-service' } },
  })
  health() {
    return { status: 'ok', service: 'payment-wrapper-service' };
  }
}
