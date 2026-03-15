import { Test, TestingModule } from '@nestjs/testing';
import { FareServiceController } from './fare-service.controller';
import { FareService } from './fare-service.service';

describe('FareServiceController', () => {
  let fareServiceController: FareServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FareServiceController],
      providers: [FareService],
    }).compile();

    fareServiceController = app.get<FareServiceController>(
      FareServiceController,
    );
  });

  describe('root', () => {
    it('should return "fare service is running"', () => {
      expect(fareServiceController.getHello()).toBe('fare service is running');
    });
  });
});
