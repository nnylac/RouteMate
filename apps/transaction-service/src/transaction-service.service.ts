import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    try {
      const transaction = this.transactionRepository.create({
        ...createTransactionDto,
        cardId: createTransactionDto.cardId ?? null,
        reference: createTransactionDto.reference ?? `txn_${Date.now()}`,
      });

      return await this.transactionRepository.save(transaction);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with id ${transactionId} not found`,
      );
    }

    return transaction;
  }

  async checkDatabaseConnection(): Promise<{
    status: string;
    database: string;
  }> {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        database: 'connected',
      };
    } catch {
      throw new InternalServerErrorException('Database connection failed');
    }
  }
}
