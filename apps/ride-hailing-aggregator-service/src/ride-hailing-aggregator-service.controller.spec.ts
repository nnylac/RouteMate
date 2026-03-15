import { Test, TestingModule } from '@nestjs/testing';
import { RideHailingAggregatorServiceController } from './ride-hailing-aggregator-service.controller';
import { RideHailingAggregatorServiceService } from './ride-hailing-aggregator-service.service';

describe('RideHailingAggregatorServiceController', () => {
  let rideHailingAggregatorServiceController: RideHailingAggregatorServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RideHailingAggregatorServiceController],
      providers: [RideHailingAggregatorServiceService],
    }).compile();

    rideHailingAggregatorServiceController = app.get<RideHailingAggregatorServiceController>(RideHailingAggregatorServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(rideHailingAggregatorServiceController.getHello()).toBe('Hello World!');
    });
  });
});
