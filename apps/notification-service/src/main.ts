import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { startNotificationConsumer } from './rabbitmq.consumer';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  await app.listen(process.env.PORT ?? 3002);

  await startNotificationConsumer();
}

bootstrap();