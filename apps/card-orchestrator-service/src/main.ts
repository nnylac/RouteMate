import { NestFactory } from '@nestjs/core';
import { CardOrchestratorServiceModule } from './card-orchestrator-service.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(CardOrchestratorServiceModule);

  const config = new DocumentBuilder()
    .setTitle('Card Orchestrator Service')
    .setDescription(
      'Orchestrates card top-up flow including payment, card balance update, transaction recording and rollback',
    )
    .setVersion('1.0')
    .addServer('http://localhost:8080', 'Via Kong Gateway')
    .addServer('http://localhost:3001', 'Direct')
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

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
