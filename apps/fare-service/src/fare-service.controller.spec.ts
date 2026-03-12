import { Test, TestingModule } from '@nestjs/testing';
import { FareServiceController } from './fare-service.controller';
import { FareServiceService } from './fare-service.service';

describe('FareServiceController', () => {
  let fareServiceController: FareServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FareServiceController],
      providers: [FareServiceService],
    }).compile();

    fareServiceController = app.get<FareServiceController>(FareServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fareServiceController.getHello()).toBe('Hello World!');
    });
  });
});
