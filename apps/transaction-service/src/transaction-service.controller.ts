import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TransactionService } from './transaction-service.service';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Controller('transactions')
export class TransactionServiceController {
  constructor(private readonly transactionService: TransactionService) {}

  // POST /transactions
  @Post()
  async create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionService.create(dto);
  }

  // PATCH /transactions/:id/status
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ): Promise<Transaction> {
    return this.transactionService.updateStatus(id, dto);
  }

  // GET /transactions
  @Get()
  async findAll(): Promise<Transaction[]> {
    return this.transactionService.findAll();
  }

  // GET /transactions/:id
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return this.transactionService.findOne(id);
  }

  // GET /transactions/card/:cardId
  @Get('card/:cardId')
  async findByCard(@Param('cardId') cardId: string): Promise<Transaction[]> {
    return this.transactionService.findByCard(cardId);
  }

  // GET /transactions/user/:userId
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string): Promise<Transaction[]> {
    return this.transactionService.findByUser(userId);
  }

  // GET /transactions/health/db
  @Get('health/db')
  async checkDatabaseConnection(): Promise<{ status: string; database: string }> {
    return this.transactionService.checkDatabaseConnection();
  }
}
