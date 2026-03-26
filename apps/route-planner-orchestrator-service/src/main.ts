import { NestFactory } from '@nestjs/core';
import { RoutePlannerOrchestratorServiceModule } from './route-planner-orchestrator-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RoutePlannerOrchestratorServiceModule);
  await app.listen(process.env.PORT ?? 3014);
}
bootstrap();