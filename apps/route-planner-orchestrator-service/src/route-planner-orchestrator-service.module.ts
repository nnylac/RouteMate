import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { RoutePlannerOrchestratorServiceController } from './route-planner-orchestrator-service.controller';
import { RoutePlannerOrchestratorServiceService } from './route-planner-orchestrator-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
  ],
  controllers: [RoutePlannerOrchestratorServiceController],
  providers: [RoutePlannerOrchestratorServiceService],
})
export class RoutePlannerOrchestratorServiceModule {}