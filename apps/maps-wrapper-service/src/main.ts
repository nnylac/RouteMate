import { NestFactory } from '@nestjs/core';
import { MapsWrapperServiceModule } from './maps-wrapper-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MapsWrapperServiceModule);
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();