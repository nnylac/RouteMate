import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransactionService } from './transaction-service.service';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionServiceController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionService.create(createTransactionDto);
  }

  @Get()
  async findAll(): Promise<Transaction[]> {
    return this.transactionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return this.transactionService.findOne(id);
  }

  @Get('health/db')
  async checkDatabaseConnection(): Promise<{
    status: string;
    database: string;
  }> {
    return this.transactionService.checkDatabaseConnection();
  }
}
