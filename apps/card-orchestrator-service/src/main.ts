import { NestFactory } from '@nestjs/core';
import { CardOrchestratorServiceModule } from './card-orchestrator-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CardOrchestratorServiceModule);
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
