import amqp from 'amqplib';
import type { Channel, Connection, ConsumeMessage } from 'amqplib';
import { NotificationService } from './notification-service.service';

export async function startNotificationConsumer(
  notificationService: NotificationService,
): Promise<void> {
  const rabbitmqUrl =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const exchange = process.env.RABBITMQ_EXCHANGE || 'routemate.events';
  const queue = process.env.RABBITMQ_QUEUE || 'notification.queue';

  const connection: Connection = await amqp.connect(rabbitmqUrl);
  const channel: Channel = await connection.createChannel();

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertQueue(queue, { durable: true });

  await channel.bindQueue(queue, exchange, 'card.topup.success');
  await channel.bindQueue(queue, exchange, 'card.topup.failed');
  await channel.bindQueue(queue, exchange, 'card.topup.rollback');
  await channel.bindQueue(queue, exchange, 'card.deduction.success');
  await channel.bindQueue(queue, exchange, 'card.deduction.failed');

  console.log('[NotificationService] Waiting for messages...');

  await channel.consume(queue, async (msg: ConsumeMessage | null) => {
    if (!msg) return;

    try {
      const content: unknown = JSON.parse(msg.content.toString());
      console.log('[NotificationService] Received event:', content);
      await notificationService.createFromEvent(
        content as {
          event?: string;
          userId?: string | number;
          cardId?: string;
          amount?: number;
          failureReason?: string;
        },
      );
      channel.ack(msg);
    } catch (error) {
      console.error(
        '[NotificationService] Failed to process event:',
        (error as Error).message,
      );
      channel.nack(msg, false, false);
    }
  });
}
