import { NestFactory } from '@nestjs/core';
import { TransactionServiceModule } from './transaction-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(TransactionServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.port ?? 3011);
}
bootstrap();
