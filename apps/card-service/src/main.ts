import { NestFactory } from '@nestjs/core';
import { CardServiceModule } from './card-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CardServiceModule);
  await app.listen(process.env.port ?? 3002);
}
bootstrap();
