import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { startNotificationConsumer } from './rabbitmq.consumer';
import { NotificationService } from './notification-service.service';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  await app.listen(process.env.PORT ?? 3006);

  await startNotificationConsumer(app.get(NotificationService));
}

bootstrap();
