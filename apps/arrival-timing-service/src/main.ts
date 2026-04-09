import { NestFactory } from '@nestjs/core';
import { ArrivalTimingServiceModule } from './arrival-timing-service.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ArrivalTimingServiceModule);

  const config = new DocumentBuilder()
    .setTitle('Arrival Timing Service')
    .setDescription(
      'Provides real-time bus and MRT arrival timings for route segments',
    )
    .setVersion('1.0')
    .addServer('http://localhost:8080', 'Via Kong Gateway')
    .addServer('http://localhost:3013', 'Direct')
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

  await app.listen(process.env.PORT ?? 3013);
}
void bootstrap();
