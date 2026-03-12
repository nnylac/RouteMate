import { NestFactory } from '@nestjs/core';
import { FareComparisonServiceModule } from './fare-comparison-service.module';

async function bootstrap() {
  const app = await NestFactory.create(FareComparisonServiceModule);
  await app.listen(process.env.port ?? 3003);
}
bootstrap();
