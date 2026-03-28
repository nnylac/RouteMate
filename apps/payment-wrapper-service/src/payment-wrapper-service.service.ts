import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreateRefundDto } from './dto/create-refund.dto';

@Injectable()
export class PaymentWrapperServiceService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
  }

  // ─── Create PaymentIntent ───────────────────────────────────────────────────

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    const amountCents = Math.round(dto.amount * 100);

    const intent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: dto.currency ?? 'sgd',
      metadata: dto.metadata ?? {},
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    return {
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
      status: intent.status,
      amount: dto.amount,
      currency: intent.currency,
    };
  }

  // ─── Confirm PaymentIntent ──────────────────────────────────────────────────
  // Use Stripe test payment methods:
  //   pm_card_visa              → success
  //   pm_card_visa_chargeDeclined → decline

  async confirmPayment(dto: ConfirmPaymentDto) {
    try {
      const intent = await this.stripe.paymentIntents.confirm(
        dto.paymentIntentId,
        {
          payment_method: dto.paymentMethod ?? 'pm_card_visa',
        },
      );

      return {
        paymentIntentId: intent.id,
        status: intent.status,
      };
    } catch (err) {
      if (err instanceof Stripe.errors.StripeCardError) {
        throw new BadRequestException({
          message: err.message,
          code: err.code,
          status: 'failed',
        });
      }
      throw err;
    }
  }

  // ─── Refund ─────────────────────────────────────────────────────────────────

  async createRefund(dto: CreateRefundDto) {
    const params: Stripe.RefundCreateParams = {
      payment_intent: dto.paymentIntentId,
    };

    if (dto.amount !== undefined) {
      params.amount = Math.round(dto.amount * 100);
    }

    const refund = await this.stripe.refunds.create(params);

    return {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
      currency: refund.currency,
    };
  }

  // ─── Retrieve PaymentIntent ─────────────────────────────────────────────────

  async getPaymentIntent(paymentIntentId: string) {
    const intent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      paymentIntentId: intent.id,
      status: intent.status,
      amount: intent.amount / 100,
      currency: intent.currency,
      metadata: intent.metadata,
    };
  }
}
