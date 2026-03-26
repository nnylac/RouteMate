import * as amqp from 'amqplib';

export async function publishTopupEvent(
  routingKey: string,
  message: any,
) {
  const rabbitmqUrl =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const exchange = process.env.RABBITMQ_EXCHANGE || 'card.topic';

  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, 'topic', { durable: true });

  channel.publish(
    exchange,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    { persistent: true },
  );

  console.log(`[Publisher] Sent ${routingKey}`, message);

  setTimeout(async () => {
    await channel.close();
    await connection.close();
  }, 500);
}