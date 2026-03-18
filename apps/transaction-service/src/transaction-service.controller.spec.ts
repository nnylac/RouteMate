import { Test, TestingModule } from '@nestjs/testing';
import { TransactionServiceController } from './transaction-service.controller';
import { TransactionService } from './transaction-service.service';

describe('TransactionServiceController', () => {
  let controller: TransactionServiceController;

  const mockTransactionService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    create: jest.fn(),
    checkDatabaseConnection: jest.fn().mockResolvedValue({
      status: 'ok',
      database: 'connected',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionServiceController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionServiceController>(
      TransactionServiceController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return database health', async () => {
    await expect(controller.checkDatabaseConnection()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
    });
  });
});
