import { Module } from '@nestjs/common';
import { RoutePlannerOrchestratorServiceController } from './route-planner-orchestrator-service.controller';
import { RoutePlannerOrchestratorServiceService } from './route-planner-orchestrator-service.service';

@Module({
  imports: [],
  controllers: [RoutePlannerOrchestratorServiceController],
  providers: [RoutePlannerOrchestratorServiceService],
})
export class RoutePlannerOrchestratorServiceModule {}
