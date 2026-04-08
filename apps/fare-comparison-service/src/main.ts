import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FareComparisonServiceModule } from './fare-comparison-service.module';

async function bootstrap() {
  const app = await NestFactory.create(FareComparisonServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Fare Comparison Service')
    .setDescription(
      'Orchestrates PT fare calculation and ride-hailing quote aggregation for side-by-side comparison',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.port ?? process.env.FARE_COMPARISON_SERVICE_PORT ?? 3003;
  await app.listen(port);
  console.log(`fare-comparison-service running on port ${port}`);
}
bootstrap();
