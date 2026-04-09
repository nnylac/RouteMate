import {
  Injectable,
  BadRequestException,
  BadGatewayException,
  Logger,
  RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import Stripe from 'stripe';
import { Request } from 'express';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';
import { CreateRefundDto } from '../dto/create-refund.dto';

@Injectable()
export class PaymentWrapperService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentWrapperService.name);
  private readonly transactionApiBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
    this.transactionApiBaseUrl =
      this.configService.get<string>('TRANSACTION_API_BASE_URL') ??
      'https://personal-1pnhiqon.outsystemscloud.com/Payment/rest/TransactionAPI';
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
    const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      paymentIntentId: intent.id,
      status: intent.status,
      amount: intent.amount / 100,
      currency: intent.currency,
      metadata: intent.metadata,
    };
  }

  async handleWebhook(req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!signature || Array.isArray(signature)) {
      throw new BadRequestException('Missing Stripe signature header');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody!,
        signature,
        webhookSecret,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Invalid webhook signature';
      throw new BadRequestException(`Webhook Error: ${message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const transactionId = this.getTransactionIdFromMetadata(
          paymentIntent.metadata,
        );

        this.logger.log(
          `Payment succeeded: ${paymentIntent.id}, amount=${paymentIntent.amount}, metadata=${JSON.stringify(paymentIntent.metadata)}`,
        );

        if (transactionId !== null) {
          await this.updateTransactionStatus(transactionId, 'success');
        } else {
          this.logger.warn(
            `Skipping transaction reconciliation for ${paymentIntent.id}: missing transactionId metadata`,
          );
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const transactionId = this.getTransactionIdFromMetadata(
          paymentIntent.metadata,
        );

        this.logger.warn(
          `Payment failed: ${paymentIntent.id}, metadata=${JSON.stringify(paymentIntent.metadata)}`,
        );

        if (transactionId !== null) {
          await this.updateTransactionStatus(transactionId, 'failed');
        } else {
          this.logger.warn(
            `Skipping transaction reconciliation for ${paymentIntent.id}: missing transactionId metadata`,
          );
        }

        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object;
        const transactionId = this.getTransactionIdFromMetadata(
          paymentIntent.metadata,
        );

        this.logger.warn(
          `Payment canceled: ${paymentIntent.id}, metadata=${JSON.stringify(paymentIntent.metadata)}`,
        );

        if (transactionId !== null) {
          await this.updateTransactionStatus(transactionId, 'failed');
        } else {
          this.logger.warn(
            `Skipping transaction reconciliation for ${paymentIntent.id}: missing transactionId metadata`,
          );
        }

        break;
      }

      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return {
      received: true,
      type: event.type,
    };
  }

  private getTransactionIdFromMetadata(metadata?: Stripe.Metadata | null) {
    const transactionId = metadata?.transactionId;

    if (!transactionId) {
      return null;
    }

    const parsed = Number(transactionId);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  private async updateTransactionStatus(
    transactionId: number,
    status: 'success' | 'failed',
  ) {
    try {
      await axios.patch(
        `${this.transactionApiBaseUrl}/transactions/${transactionId}/status`,
        {
          Id: transactionId,
          Status: status,
          Order: 0,
          Is_Active: true,
        },
      );

      this.logger.log(
        `Reconciled OutSystems transaction ${transactionId} to ${status}`,
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status ?? 502;
        const payload = error.response?.data as
          | { message?: string; Message?: string }
          | string
          | undefined;
        const message =
          typeof payload === 'string'
            ? payload
            : (payload?.message ??
              payload?.Message ??
              'Unable to update transaction status');

        throw new BadGatewayException({
          statusCode,
          message,
        });
      }

      throw error;
    }
  }
}
