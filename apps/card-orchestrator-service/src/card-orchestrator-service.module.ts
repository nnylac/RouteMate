import { Module } from '@nestjs/common';
import { CardOrchestratorServiceController } from './card-orchestrator-service.controller';
import { CardOrchestratorServiceService } from './card-orchestrator-service.service';
import { RabbitMQPublisher } from './rabbitmq.publisher';

@Module({
  imports: [],
  controllers: [CardOrchestratorServiceController],
  providers: [CardOrchestratorServiceService, RabbitMQPublisher],
})
export class CardOrchestratorServiceModule {}
