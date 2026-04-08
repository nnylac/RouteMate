import { Test, TestingModule } from '@nestjs/testing';
import { CardServiceController } from './card-service.controller';
import { CardService } from './card-service.service';

describe('CardServiceController', () => {
  let cardServiceController: CardServiceController;

  const mockCardService = {
    getHello: jest.fn().mockReturnValue('card service is running'),
    createTestCard: jest.fn().mockResolvedValue({
      userId: 'user_001',
      cardNumber: 'CARD0001',
      cardType: 'adult',
      balance: 25,
      status: 'active',
    }),
    getAllCards: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardServiceController],
      providers: [
        {
          provide: CardService,
          useValue: mockCardService,
        },
      ],
    }).compile();

    cardServiceController = module.get<CardServiceController>(
      CardServiceController,
    );
  });

  it('should return service status', () => {
    expect(cardServiceController.getHello()).toBe('card service is running');
  });

  it('should return all cards', async () => {
    const result = await cardServiceController.getAllCards();
    expect(result).toEqual([]);
  });
});
