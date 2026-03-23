import { Test, TestingModule } from '@nestjs/testing';
import { RideHailingAggregatorServiceController } from './ride-hailing-aggregator-service.controller';
import { RideHailingAggregatorServiceService } from './ride-hailing-aggregator-service.service';

describe('RideHailingAggregatorServiceController', () => {
  // Use a shorter name for the instance variable
  let controller: RideHailingAggregatorServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RideHailingAggregatorServiceController],
      providers: [RideHailingAggregatorServiceService],
    }).compile();

    // Assign the instance to the shorter variable name
    controller = app.get<RideHailingAggregatorServiceController>(
      RideHailingAggregatorServiceController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
