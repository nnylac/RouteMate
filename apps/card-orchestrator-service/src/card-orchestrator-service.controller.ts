import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CardOrchestratorServiceService } from './card-orchestrator-service.service';

@ApiTags('Card Orchestrator Service')
@Controller('card-orchestrator')
export class CardOrchestratorServiceController {
  constructor(
    private readonly cardOrchestratorServiceService: CardOrchestratorServiceService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Card orchestrator service is running',
    schema: { example: 'card orchestrator service is running' },
  })
  getHello(): string {
    return this.cardOrchestratorServiceService.getHello();
  }

  @Get('cards/user/:userId')
  @ApiOperation({ summary: 'Get all cards for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user123' })
  @ApiResponse({
    status: 200,
    description: 'List of cards for the user',
    schema: {
      example: [
        {
          _id: '6614a2f3c9b1234567890abc',
          userId: 'user123',
          cardType: 'adult',
          balance: 20.5,
          status: 'active',
        },
      ],
    },
  })
  async getCardsByUser(@Param('userId') userId: string) {
    return this.cardOrchestratorServiceService.getCardsByUser(userId);
  }

  @Get('cards/:id')
  @ApiOperation({ summary: 'Get a card by ID' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB card _id',
    example: '6614a2f3c9b1234567890abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Card found',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'user123',
        cardType: 'adult',
        balance: 20.5,
        status: 'active',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Card not found',
    schema: {
      example: {
        message: 'Card not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async getCardById(@Param('id') id: string) {
    return this.cardOrchestratorServiceService.getCardById(id);
  }

  @Post('cards')
  @ApiOperation({ summary: 'Create a new card' })
  @ApiBody({
    schema: {
      example: { userId: 'user123', cardType: 'adult' },
      properties: {
        userId: { type: 'string', example: 'user123' },
        cardType: {
          type: 'string',
          enum: ['adult', 'student', 'senior'],
          example: 'adult',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Card created successfully',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'user123',
        cardType: 'adult',
        balance: 0,
        status: 'active',
      },
    },
  })
  async createCard(@Body() body: { userId: string; cardType: string }) {
    return this.cardOrchestratorServiceService.createCard(body);
  }

  @Patch('cards/:id/topup')
  @ApiOperation({
    summary:
      'Top up card — orchestrates payment + balance update + transaction record',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB card _id',
    example: '6614a2f3c9b1234567890abc',
  })
  @ApiBody({
    schema: {
      example: { amount: 20.0 },
      properties: { amount: { type: 'number', example: 20.00 } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Top-up successful',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'user123',
        balance: 40.5,
        status: 'active',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Amount must be greater than 0',
    schema: {
      example: {
        message: 'Top up amount must be greater than 0',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async topUpCard(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.cardOrchestratorServiceService.topUpCard(id, body.amount);
  }

  @Patch('cards/:id/deduct')
  @ApiOperation({ summary: 'Deduct fare from card' })
  @ApiParam({ name: 'id', description: 'MongoDB card _id', example: '6614a2f3c9b1234567890abc' })
  @ApiBody({
    schema: {
      example: { amount: 1.5 },
      properties: { amount: { type: 'number', example: 1.50 } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Deduction successful',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'user123',
        balance: 19.0,
        status: 'active',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient balance or card not active',
    schema: {
      example: {
        message: 'Insufficient balance',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async deductFare(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.cardOrchestratorServiceService.deductFare(id, body.amount);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Create a transaction record' })
  @ApiBody({
    schema: {
      example: {
        userId: 'user123',
        cardId: '6614a2f3c9b1234567890abc',
        amount: 20.0,
        transactionType: 'top_up',
        status: 'success',
        reference: 'REF123',
        paymentReference: 'PAY456',
      },
      properties: {
        userId: { type: 'string', example: 'user123' },
        cardId: { type: 'string', example: '6614a2f3c9b1234567890abc' },
        amount: { type: 'number', example: 20.0 },
        transactionType: {
          type: 'string',
          enum: ['top_up', 'payment', 'refund'],
          example: 'top_up',
        },
        status: {
          type: 'string',
          enum: ['pending', 'success', 'failed', 'rolled_back'],
          example: 'success',
        },
        reference: { type: 'string', example: 'REF123' },
        paymentReference: { type: 'string', example: 'PAY456' },
        failureReason: { type: 'string', example: 'Card declined' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  async createTransaction(@Body() body: {
      userId: string | number;
      cardId: string;
      amount: number;
      transactionType: 'top_up' | 'payment' | 'refund';
      status: 'pending' | 'success' | 'failed' | 'rolled_back';
      reference?: string;
      paymentReference?: string;
      failureReason?: string;
    },
  ) {
    return this.cardOrchestratorServiceService.createTransaction(body);
  }

  @Patch('transactions/:transactionId/status')
  @ApiOperation({
    summary: 'Update transaction status — used for rollback flow',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    example: '1',
  })
  @ApiBody({
    schema: {
      example: {
        status: 'rolled_back',
        failureReason: 'Card balance update failed after payment',
      },
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'success', 'failed', 'rolled_back'],
          example: 'rolled_back',
        },
        failureReason: {
          type: 'string',
          example: 'Card balance update failed after payment',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Transaction status updated' })
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
  async updateTransactionStatus(
    @Param('transactionId') transactionId: string,
    @Body()
    body: {
      status: 'pending' | 'success' | 'failed' | 'rolled_back';
      failureReason?: string;
    },
  ) {
    return this.cardOrchestratorServiceService.updateTransactionStatus(Number(transactionId), body);
  }

  @Get('transactions/:userId/:cardId')
  @ApiOperation({ summary: 'Get transaction records for a user and card' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user123' })
  @ApiParam({
    name: 'cardId',
    description: 'MongoDB card _id',
    example: '6614a2f3c9b1234567890abc',
  })
  @ApiResponse({
    status: 200,
    description: 'List of transactions',
    schema: {
      example: [
        {
          id: 1,
          userId: 'user123',
          cardId: '6614a2f3c9b1234567890abc',
          amount: 20.00,
          transactionType: 'top_up',
          status: 'success',
        },
      ],
    },
  })
  async getTransactionsRecords(
    @Param('userId') userId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.cardOrchestratorServiceService.getTransactionsRecords(userId, cardId);
  }
}
