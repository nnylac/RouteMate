import { Test, TestingModule } from '@nestjs/testing';
import { MapsWrapperServiceController } from './maps-wrapper-service.controller';
import { MapsWrapperServiceService } from './maps-wrapper-service.service';

describe('MapsWrapperServiceController', () => {
  let mapsWrapperServiceController: MapsWrapperServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MapsWrapperServiceController],
      providers: [MapsWrapperServiceService],
    }).compile();

    mapsWrapperServiceController = app.get<MapsWrapperServiceController>(
      MapsWrapperServiceController,
    );
  });

  it('should be defined', () => {
    expect(mapsWrapperServiceController).toBeDefined();
  });
});
