import { Test, TestingModule } from '@nestjs/testing';
import { RouteServiceController } from './route-service.controller';
import { RouteServiceService } from './route-service.service';

describe('RouteServiceController', () => {
  let routeServiceController: RouteServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RouteServiceController],
      providers: [RouteServiceService],
    }).compile();

    routeServiceController = app.get<RouteServiceController>(RouteServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(routeServiceController.getHello()).toBe('Hello World!');
    });
  });
});
