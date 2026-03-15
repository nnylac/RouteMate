import { Test, TestingModule } from '@nestjs/testing';
import { RideHailingWrapperServiceController } from './ride-hailing-wrapper-service.controller';
import { RideHailingWrapperServiceService } from './ride-hailing-wrapper-service.service';

describe('RideHailingWrapperServiceController', () => {
  let rideHailingWrapperServiceController: RideHailingWrapperServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RideHailingWrapperServiceController],
      providers: [RideHailingWrapperServiceService],
    }).compile();

    rideHailingWrapperServiceController = app.get<RideHailingWrapperServiceController>(RideHailingWrapperServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(rideHailingWrapperServiceController.getHello()).toBe('Hello World!');
    });
  });
});
