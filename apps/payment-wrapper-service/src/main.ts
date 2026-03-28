import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PaymentWrapperServiceModule } from './payment-wrapper-service.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentWrapperServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.port ?? 3007);
}
bootstrap();
