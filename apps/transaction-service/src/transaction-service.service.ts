import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import {
  TransactionStatus,
  VALID_TRANSITIONS,
} from './enums/transaction-status.enum';
import { TransactionType } from './enums/transaction-type.enum';
import { RabbitMQPublisher } from './publisher/rabbitmq.publisher';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
    private readonly publisher: RabbitMQPublisher,
  ) {}

  // ─── Create (always starts PENDING) ────────────────────────────────────────

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    try {
      const transaction = this.transactionRepository.create({
        ...dto,
        cardId: dto.cardId ?? null,
        reference: dto.reference ?? `txn_${Date.now()}`,
        paymentReference: dto.paymentReference ?? null,
        failureReason: null,
      });
      return await this.transactionRepository.save(transaction);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // ─── Update status (with transition guard + AMQP events) ───────────────────

  async updateStatus(
    transactionId: string,
    dto: UpdateTransactionStatusDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(transactionId);

    const allowed = VALID_TRANSITIONS[transaction.status];
    if (!allowed.includes(dto.status)) {
      throw new ConflictException(
        `Cannot transition from '${transaction.status}' to '${dto.status}'`,
      );
    }

    transaction.status = dto.status;

    if (dto.status === TransactionStatus.FAILED) {
      transaction.failureReason = dto.failureReason ?? null;
    }

    const saved = await this.transactionRepository.save(transaction);

    // Publish AMQP event for TOP_UP transactions
    if (transaction.transactionType === TransactionType.TOP_UP) {
      if (dto.status === TransactionStatus.SUCCESS) {
        void this.publisher.publishTopUpSuccess(saved);
      } else if (dto.status === TransactionStatus.FAILED) {
        void this.publisher.publishTopUpFailed(saved);
      } else if (dto.status === TransactionStatus.ROLLED_BACK) {
        void this.publisher.publishTopUpRolledBack(saved);
      }
    }

    return saved;
  }

  // ─── Queries ────────────────────────────────────────────────────────────────

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

  async findByCard(cardId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { cardId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Health ─────────────────────────────────────────────────────────────────

  async checkDatabaseConnection(): Promise<{ status: string; database: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', database: 'connected' };
    } catch {
      throw new InternalServerErrorException('Database connection failed');
    }
  }
}
