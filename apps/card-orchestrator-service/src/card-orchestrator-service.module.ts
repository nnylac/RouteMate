import { Module } from '@nestjs/common';
import { CardOrchestratorServiceController } from './card-orchestrator-service.controller';
import { CardOrchestratorServiceService } from './card-orchestrator-service.service';

@Module({
  imports: [],
  controllers: [CardOrchestratorServiceController],
  providers: [CardOrchestratorServiceService],
})
export class CardOrchestratorServiceModule {}
