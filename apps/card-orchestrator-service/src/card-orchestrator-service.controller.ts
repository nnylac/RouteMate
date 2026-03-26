import { Controller, Get, Post } from '@nestjs/common';
import { CardOrchestratorServiceService } from './card-orchestrator-service.service';
import { publishTopupEvent } from './rabbitmq.publisher';
import { randomUUID } from 'crypto';

@Controller()
export class CardOrchestratorServiceController {
  constructor(private readonly cardOrchestratorServiceService: CardOrchestratorServiceService) {}

  @Get()
  getHello(): string {
    return this.cardOrchestratorServiceService.getHello();
  }
    // Temporary AMQP test endpoint.
  // This will later be replaced/invoked by the actual top-up orchestration flow.
  @Post('test-publish')
  async testPublish() {
    const message = {
      eventID: randomUUID(),
      userID: 1,
      type: 'card.topup.success',
      payload_json: {
        cardID: 101,
        txnID: 'txn-001',
        topup_amt: 20,
        new_balance: 50,
      },
      txnStatus: 'SUCCESS',
      created_at: new Date().toISOString(),
    };

    await publishTopupEvent('card.topup.success', message);

    return {
      message: 'Test event published successfully',
      data: message,
    };
  }
}
