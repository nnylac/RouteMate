import { Test, TestingModule } from '@nestjs/testing';
import { FareComparisonServiceController } from './fare-comparison-service.controller';
import { FareComparisonServiceService } from './fare-comparison-service.service';

describe('FareComparisonServiceController', () => {
  let fareComparisonServiceController: FareComparisonServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FareComparisonServiceController],
      providers: [FareComparisonServiceService],
    }).compile();

    fareComparisonServiceController = app.get<FareComparisonServiceController>(FareComparisonServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fareComparisonServiceController.getHello()).toBe('Hello World!');
    });
  });
});
