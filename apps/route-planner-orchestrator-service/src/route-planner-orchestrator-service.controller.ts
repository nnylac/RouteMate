import { Controller, Get } from '@nestjs/common';
import { RoutePlannerOrchestratorServiceService } from './route-planner-orchestrator-service.service';

@Controller()
export class RoutePlannerOrchestratorServiceController {
  constructor(private readonly routePlannerOrchestratorServiceService: RoutePlannerOrchestratorServiceService) {}

  @Get()
  getHello(): string {
    return this.routePlannerOrchestratorServiceService.getHello();
  }
}
