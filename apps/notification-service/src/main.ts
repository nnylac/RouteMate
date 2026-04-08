import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);

  // Connect RabbitMQ consumer
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'route_events',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3006);
}
bootstrap();