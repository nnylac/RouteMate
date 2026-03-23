import { NestFactory } from '@nestjs/core';
import { RideHailingAggregatorServiceModule } from './ride-hailing-aggregator-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RideHailingAggregatorServiceModule);
  app.enableCors();
  await app.listen(process.env.port ?? 3008);
}
bootstrap();
