import { Controller, Get } from '@nestjs/common';
import { CardOrchestratorServiceService } from './card-orchestrator-service.service';

@Controller()
export class CardOrchestratorServiceController {
  constructor(private readonly cardOrchestratorServiceService: CardOrchestratorServiceService) {}

  @Get()
  getHello(): string {
    return this.cardOrchestratorServiceService.getHello();
  }
}
