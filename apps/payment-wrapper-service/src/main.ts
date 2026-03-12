import { NestFactory } from '@nestjs/core';
import { PaymentWrapperServiceModule } from './payment-wrapper-service.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentWrapperServiceModule);
  await app.listen(process.env.port ?? 3007);
}
bootstrap();
