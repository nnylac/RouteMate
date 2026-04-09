import { NestFactory } from '@nestjs/core';
import { RideHailingWrapperServiceModule } from './ride-hailing-wrapper-service.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(RideHailingWrapperServiceModule);

  const config = new DocumentBuilder()
    .setTitle('Ride-Hailing Wrapper Service')
    .setDescription(
      'Fetches ride quotes from individual providers via mocked API',
    )
    .setVersion('1.0')
    .addServer('http://localhost:8080', 'Via Kong Gateway')
    .addServer('http://localhost:3009', 'Direct')
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

  await app.listen(process.env.PORT ?? 3009);
  console.log('Wrapper running on port 3009');
}
void bootstrap();
