import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CardOrchestratorServiceService } from './card-orchestrator-service.service';

@Controller('card-orchestrator')
export class CardOrchestratorServiceController {
  constructor(private readonly cardOrchestratorServiceService: CardOrchestratorServiceService) {}

  @Get()
  getHello(): string {
    return this.cardOrchestratorServiceService.getHello();
  }

  @Get('cards/user/:userId')
  async getCardsByUser(@Param('userId') userId: string) {
    return this.cardOrchestratorServiceService.getCardsByUser(userId);
  }

  @Get('cards/:id')
  async getCardById(@Param('id') id: string) {
    return this.cardOrchestratorServiceService.getCardById(id);
  }

  @Post('cards')
  async createCard(@Body() body: { userId: string; cardType: string }) {
    return this.cardOrchestratorServiceService.createCard(body);
  }

  @Patch('cards/:id/topup')
  async topUpCard(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.cardOrchestratorServiceService.topUpCard(id, body.amount);
  }

  @Patch('cards/:id/deduct')
  async deductFare(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.cardOrchestratorServiceService.deductFare(id, body.amount);
  }

  @Post('transactions')
  async createTransaction(
    @Body()
    body: {
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
  async updateTransactionStatus(
    @Param('transactionId') transactionId: string,
    @Body()
    body: {
      status: 'pending' | 'success' | 'failed' | 'rolled_back';
      failureReason?: string;
    },
  ) {
    return this.cardOrchestratorServiceService.updateTransactionStatus(
      Number(transactionId),
      body,
    );
  }

  @Get('transactions/:userId/:cardId')
  async getTransactionsRecords(
    @Param('userId') userId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.cardOrchestratorServiceService.getTransactionsRecords(
      userId,
      cardId,
    );
  }
}
