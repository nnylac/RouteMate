import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TransactionService } from './transaction-service.service';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@ApiTags('Transaction Service')
@Controller('transactions')
export class TransactionServiceController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction record' })
  @ApiBody({
    type: CreateTransactionDto,
    examples: {
      topUp: {
        summary: 'Card top-up transaction',
        value: {
          userId: 'user123',
          cardId: '6614a2f3c9b1234567890abc',
          transactionType: 'top_up',
          amount: '20.00',
          status: 'pending',
          paymentReference: 'pi_stripe123',
        },
      },
      payment: {
        summary: 'Fare payment transaction',
        value: {
          userId: 'user123',
          cardId: '6614a2f3c9b1234567890abc',
          transactionType: 'payment',
          amount: '1.50',
          status: 'success',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    schema: {
      example: {
        id: 1,
        userId: 'user123',
        cardId: '6614a2f3c9b1234567890abc',
        transactionType: 'top_up',
        amount: '20.00',
        status: 'pending',
        paymentReference: 'pi_stripe123',
        createdAt: '2026-04-09T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    schema: {
      example: {
        message: ['transactionType must be a valid enum value'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionService.create(dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary:
      'Update transaction status — used for success, failure and rollback flows',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID', example: '1' })
  @ApiBody({
    type: UpdateTransactionStatusDto,
    examples: {
      success: { summary: 'Mark as success', value: { status: 'success' } },
      rolledBack: {
        summary: 'Mark as rolled back',
        value: {
          status: 'rolled_back',
          failureReason: 'Card balance update failed after payment',
        },
      },
      failed: {
        summary: 'Mark as failed',
        value: { status: 'failed', failureReason: 'Payment declined' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction status updated',
    schema: {
      example: {
        id: 1,
        userId: 'user123',
        cardId: '6614a2f3c9b1234567890abc',
        transactionType: 'top_up',
        amount: '20.00',
        status: 'rolled_back',
        failureReason: 'Card balance update failed after payment',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
    schema: {
      example: {
        message: 'Transaction not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ): Promise<Transaction> {
    return this.transactionService.updateStatus(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of all transactions',
    schema: {
      example: [
        {
          id: 1,
          userId: 'user123',
          cardId: '6614a2f3c9b1234567890abc',
          transactionType: 'top_up',
          amount: '20.00',
          status: 'success',
          createdAt: '2026-04-09T10:00:00.000Z',
        },
      ],
    },
  })
  async findAll(): Promise<Transaction[]> {
    return this.transactionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Transaction found',
    schema: {
      example: {
        id: 1,
        userId: 'user123',
        cardId: '6614a2f3c9b1234567890abc',
        transactionType: 'top_up',
        amount: '20.00',
        status: 'success',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
    schema: {
      example: {
        message: 'Transaction not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return this.transactionService.findOne(id);
  }

  @Get('card/:cardId')
  @ApiOperation({ summary: 'Get all transactions for a card' })
  @ApiParam({
    name: 'cardId',
    description: 'MongoDB card _id',
    example: '6614a2f3c9b1234567890abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions for the card',
    schema: {
      example: [
        {
          id: 1,
          userId: 'user123',
          cardId: '6614a2f3c9b1234567890abc',
          transactionType: 'top_up',
          amount: '20.00',
          status: 'success',
        },
      ],
    },
  })
  async findByCard(@Param('cardId') cardId: string): Promise<Transaction[]> {
    return this.transactionService.findByCard(cardId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all transactions for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user123' })
  @ApiResponse({
    status: 200,
    description: 'Transactions for the user',
    schema: {
      example: [
        {
          id: 1,
          userId: 'user123',
          cardId: '6614a2f3c9b1234567890abc',
          transactionType: 'top_up',
          amount: '20.00',
          status: 'success',
        },
      ],
    },
  })
  async findByUser(@Param('userId') userId: string): Promise<Transaction[]> {
    return this.transactionService.findByUser(userId);
  }

  @Get('health/db')
  @ApiOperation({ summary: 'Check PostgreSQL database connection health' })
  @ApiResponse({
    status: 200,
    description: 'Database connection healthy',
    schema: { example: { status: 'ok', database: 'connected' } },
  })
  @ApiResponse({
    status: 500,
    description: 'Database connection failed',
    schema: { example: { status: 'error', database: 'disconnected' } },
  })
  async checkDatabaseConnection(): Promise<{
    status: string;
    database: string;
  }> {
    return this.transactionService.checkDatabaseConnection();
  }
}
