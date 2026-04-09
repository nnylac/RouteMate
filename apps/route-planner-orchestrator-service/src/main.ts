import { NestFactory } from '@nestjs/core';
import { RoutePlannerOrchestratorServiceModule } from './route-planner-orchestrator-service.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(RoutePlannerOrchestratorServiceModule);

  const config = new DocumentBuilder()
    .setTitle('Route Planner Orchestrator Service')
    .setDescription(
      'Orchestrates route planning — calls Google Maps, enriches with arrival timings, caches routes, handles disruptions via RabbitMQ',
    )
    .setVersion('1.0')
    .addServer('http://localhost:8080', 'Via Kong Gateway')
    .addServer('http://localhost:3014', 'Direct')
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

  await app.listen(process.env.PORT ?? 3014);
}
void bootstrap();
