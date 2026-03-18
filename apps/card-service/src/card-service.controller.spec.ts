import { Test, TestingModule } from '@nestjs/testing';
import { CardServiceController } from './card-service.controller';
import { CardService } from './card-service.service';

describe('CardServiceController', () => {
  let cardServiceController: CardServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CardServiceController],
      providers: [CardService],
    }).compile();

    cardServiceController = app.get<CardServiceController>(
      CardServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(cardServiceController.getHello()).toBe('Hello World!');
    });
  });
});
