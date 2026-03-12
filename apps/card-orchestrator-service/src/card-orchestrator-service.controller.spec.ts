import { Test, TestingModule } from '@nestjs/testing';
import { CardOrchestratorServiceController } from './card-orchestrator-service.controller';
import { CardOrchestratorServiceService } from './card-orchestrator-service.service';

describe('CardOrchestratorServiceController', () => {
  let cardOrchestratorServiceController: CardOrchestratorServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CardOrchestratorServiceController],
      providers: [CardOrchestratorServiceService],
    }).compile();

    cardOrchestratorServiceController = app.get<CardOrchestratorServiceController>(CardOrchestratorServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(cardOrchestratorServiceController.getHello()).toBe('Hello World!');
    });
  });
});
