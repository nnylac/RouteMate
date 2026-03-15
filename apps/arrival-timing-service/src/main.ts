import { NestFactory } from '@nestjs/core';
import { ArrivalTimingServiceModule } from './arrival-timing-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ArrivalTimingServiceModule);
  await app.listen(process.env.port ?? 3013);
}
bootstrap();
