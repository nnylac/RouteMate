import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

const DEFAULT_URL = 'amqp://guest:guest@localhost:5672';
const DEFAULT_EXCHANGE = 'routemate.events';

@Injectable()
export class RabbitMQPublisher implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQPublisher.name);
  private readonly url = process.env.RABBITMQ_URL ?? DEFAULT_URL;
  private readonly exchange =
    process.env.RABBITMQ_EXCHANGE ?? DEFAULT_EXCHANGE;
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  private async getChannel() {
    if (this.channel) {
      return this.channel;
    }

    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    return this.channel;
  }

  async publish(routingKey: string, payload: object) {
    try {
      const channel = await this.getChannel();
      channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { contentType: 'application/json', persistent: true },
      );
      this.logger.log(`Published [${routingKey}]`);
    } catch (error) {
      this.logger.error(
        `Failed to publish [${routingKey}]: ${(error as Error).message}`,
      );
    }
  }

  publishTopUpSuccess(payload: {
    cardId: string;
    userId: string | number;
    amount: number;
    balance?: number;
    transactionId?: number;
  }) {
    return this.publish('card.topup.success', {
      event: 'card.topup.success',
      currency: 'SGD',
      ...payload,
    });
  }

  publishTopUpFailed(payload: {
    cardId: string;
    userId: string | number;
    amount: number;
    balance?: number;
    failureReason?: string;
    transactionId?: number;
  }) {
    return this.publish('card.topup.failed', {
      event: 'card.topup.failed',
      ...payload,
    });
  }

  publishTopUpRolledBack(payload: {
    cardId: string;
    userId: string | number;
    amount: number;
    balance?: number;
    transactionId?: number;
    failureReason?: string;
  }) {
    return this.publish('card.topup.rollback', {
      event: 'card.topup.rollback',
      currency: 'SGD',
      ...payload,
    });
  }

  publishDeductionSuccess(payload: {
    cardId: string;
    userId: string | number;
    amount: number;
    balance?: number;
    transactionId?: number;
  }) {
    return this.publish('card.deduction.success', {
      event: 'card.deduction.success',
      currency: 'SGD',
      ...payload,
    });
  }

  publishDeductionFailed(payload: {
    cardId: string;
    userId: string | number;
    amount: number;
    balance?: number;
    failureReason?: string;
    transactionId?: number;
  }) {
    return this.publish('card.deduction.failed', {
      event: 'card.deduction.failed',
      ...payload,
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
