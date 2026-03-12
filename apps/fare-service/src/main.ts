import { NestFactory } from '@nestjs/core';
import { FareServiceModule } from './fare-service.module';

async function bootstrap() {
  const app = await NestFactory.create(FareServiceModule);
  await app.listen(process.env.port ?? 3004);
}
bootstrap();
