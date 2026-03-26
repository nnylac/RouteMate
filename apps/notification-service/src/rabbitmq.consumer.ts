import * as amqp from 'amqplib';

export async function startNotificationConsumer() {
  const rabbitmqUrl =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const exchange = process.env.RABBITMQ_EXCHANGE || 'card.topic';
  const queue = process.env.RABBITMQ_QUEUE || 'notification.queue';

  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertQueue(queue, { durable: true });

  await channel.bindQueue(queue, exchange, 'card.topup.success');
  await channel.bindQueue(queue, exchange, 'card.topup.failed');
  await channel.bindQueue(queue, exchange, 'card.topup.rollback');

  console.log('[NotificationService] Waiting for messages...');

  channel.consume(queue, (msg) => {
    if (!msg) return;

    const content = JSON.parse(msg.content.toString());
    console.log('[NotificationService] Received event:', content);

    channel.ack(msg);
  });
}