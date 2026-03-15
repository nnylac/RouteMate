import { NestFactory } from '@nestjs/core';
import { RideHailingWrapperServiceModule } from './ride-hailing-wrapper-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RideHailingWrapperServiceModule);
  await app.listen(process.env.port ?? 3009);
}
bootstrap();
