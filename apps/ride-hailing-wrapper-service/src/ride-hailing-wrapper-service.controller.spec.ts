import { Test, TestingModule } from '@nestjs/testing';
import { RideHailingWrapperServiceController } from './ride-hailing-wrapper-service.controller';
import { RideHailingWrapperServiceService } from './ride-hailing-wrapper-service.service';

describe('RideHailingWrapperServiceController', () => {
  let controller: RideHailingWrapperServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RideHailingWrapperServiceController],
      providers: [RideHailingWrapperServiceService],
    }).compile();

    controller = module.get<RideHailingWrapperServiceController>(
      RideHailingWrapperServiceController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
