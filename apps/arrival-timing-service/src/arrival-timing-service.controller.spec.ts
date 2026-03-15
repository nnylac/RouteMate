import { Test, TestingModule } from '@nestjs/testing';
import { ArrivalTimingServiceController } from './arrival-timing-service.controller';
import { ArrivalTimingServiceService } from './arrival-timing-service.service';

describe('ArrivalTimingServiceController', () => {
  let arrivalTimingServiceController: ArrivalTimingServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ArrivalTimingServiceController],
      providers: [ArrivalTimingServiceService],
    }).compile();

    arrivalTimingServiceController = app.get<ArrivalTimingServiceController>(ArrivalTimingServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(arrivalTimingServiceController.getHello()).toBe('Hello World!');
    });
  });
});
