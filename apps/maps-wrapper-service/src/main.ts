import { NestFactory } from '@nestjs/core';
import { MapsWrapperServiceModule } from './maps-wrapper-service.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(MapsWrapperServiceModule);

  const config = new DocumentBuilder()
    .setTitle('Maps Wrapper Service')
    .setDescription(
      'Wraps the Google Maps Directions API to retrieve public transport route options between two locations',
    )
    .setVersion('1.0')
    .addServer('http://localhost:8080', 'Via Kong Gateway')
    .addServer('http://localhost:3005', 'Direct')
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

  await app.listen(process.env.PORT ?? 3005);
}
void bootstrap();
