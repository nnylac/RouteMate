import { NestFactory } from '@nestjs/core';
import { RouteCacheServiceModule } from './route-cache-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RouteCacheServiceModule);
  await app.listen(process.env.port ?? 3010);
}
bootstrap();
