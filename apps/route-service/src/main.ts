import { NestFactory } from '@nestjs/core';
import { RouteServiceModule } from './route-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RouteServiceModule);
  await app.listen(process.env.port ?? 3008);
}
bootstrap();
