import { Test, TestingModule } from '@nestjs/testing';
import { RoutePlannerOrchestratorServiceController } from './route-planner-orchestrator-service.controller';
import { RoutePlannerOrchestratorServiceService } from './route-planner-orchestrator-service.service';

describe('RoutePlannerOrchestratorServiceController', () => {
  let routePlannerOrchestratorServiceController: RoutePlannerOrchestratorServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RoutePlannerOrchestratorServiceController],
      providers: [RoutePlannerOrchestratorServiceService],
    }).compile();

    routePlannerOrchestratorServiceController = app.get<RoutePlannerOrchestratorServiceController>(RoutePlannerOrchestratorServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(routePlannerOrchestratorServiceController.getHello()).toBe('Hello World!');
    });
  });
});
