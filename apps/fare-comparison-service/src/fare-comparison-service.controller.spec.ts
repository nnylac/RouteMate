import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { FareComparisonServiceController } from './fare-comparison-service.controller';
import { FareComparisonServiceService } from './fare-comparison-service.service';

describe('FareComparisonServiceController', () => {
  let fareComparisonServiceController: FareComparisonServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [FareComparisonServiceController],
      providers: [FareComparisonServiceService],
    }).compile();

    fareComparisonServiceController =
      app.get<FareComparisonServiceController>(FareComparisonServiceController);
  });

  describe('health', () => {
    it('should return service health status', () => {
      expect(fareComparisonServiceController.health()).toEqual({
        status: 'ok',
        service: 'fare-comparison-service',
      });
    });
  });
});
