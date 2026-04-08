import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Transaction } from '../entities/transaction.entity';

const EXCHANGE = 'routemate.events';

@Injectable()
export class RabbitMQPublisher implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQPublisher.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly url: string;

  constructor(private readonly configService: ConfigService) {
    this.url = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://guest:guest@localhost:5672',
    );
  }

  private async getChannel(): Promise<amqp.Channel> {
    if (this.channel) return this.channel;

    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    return this.channel;
  }

  async publish(routingKey: string, payload: object): Promise<void> {
    try {
      const channel = await this.getChannel();
      channel.publish(
        EXCHANGE,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { contentType: 'application/json', persistent: true },
      );
      this.logger.log(`Published [${routingKey}]`);
    } catch (err) {
      // Non-fatal — log and continue; the transaction is already saved
      this.logger.error(
        `Failed to publish [${routingKey}]: ${(err as Error).message}`,
      );
    }
  }

  // ─── Typed helpers ──────────────────────────────────────────────────────────

  publishTopUpSuccess(txn: Transaction) {
    return this.publish('card.topup.success', {
      event: 'card.topup.success',
      transactionId: txn.transactionId,
      cardId: txn.cardId,
      userId: txn.userId,
      amount: txn.amount,
      currency: 'SGD',
    });
  }

  publishTopUpFailed(txn: Transaction) {
    return this.publish('card.topup.failed', {
      event: 'card.topup.failed',
      transactionId: txn.transactionId,
      cardId: txn.cardId,
      userId: txn.userId,
      failureReason: txn.failureReason,
    });
  }

  publishTopUpRolledBack(txn: Transaction) {
    return this.publish('card.topup.rolledback', {
      event: 'card.topup.rolledback',
      transactionId: txn.transactionId,
      cardId: txn.cardId,
      userId: txn.userId,
      amount: txn.amount,
      currency: 'SGD',
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
