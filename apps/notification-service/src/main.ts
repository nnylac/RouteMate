import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { startNotificationConsumer } from './rabbitmq.consumer';
import { NotificationService } from './notification-service.service';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'route_events',
      queueOptions: { durable: true },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Notification Service')
    .setDescription(
      'Manages notifications — HTTP endpoints for direct creation, RabbitMQ consumer for event-driven notifications',
    )
    .setVersion('1.0')
    .addServer('http://localhost:8080', 'Via Kong Gateway')
    .addServer('http://localhost:3006', 'Direct')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js',
    ],
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3006);

  await startNotificationConsumer(app.get(NotificationService));
}
bootstrap();
