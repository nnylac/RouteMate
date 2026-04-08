import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';

type TransactionType = 'top_up' | 'payment' | 'refund';

@Injectable()
export class CardOrchestratorServiceService {
  private readonly cardServiceBaseUrl =
    process.env.CARD_SERVICE_URL ?? 'http://localhost:3002/card-service';

  getHello(): string {
    return 'Hello World!';
  }

  async getCardsByUser(userId: string) {
    return this.forwardRequest('get', `/cards/user/${userId}`);
  }

  async getCardById(id: string) {
    return this.forwardRequest('get', `/cards/${id}`);
  }

  async createCard(body: { userId: string; cardType: string }) {
    if (!body.userId) {
      throw new BadRequestException('userId is required');
    }

    if (!body.cardType) {
      throw new BadRequestException('cardType is required');
    }

    return this.forwardRequest('post', '/cards', body);
  }

  async topUpCard(id: string, amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }

    const updatedCard = await this.forwardRequest(
      'patch',
      `/cards/${id}/topup`,
      { amount },
    );

    return updatedCard;
  }

  async deductFare(id: string, amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }

    return this.forwardRequest(
      'patch',
      `/cards/${id}/deduct`,
      { amount },
    );
  }

  private async forwardRequest(
    method: 'get' | 'post' | 'patch',
    path: string,
    data?: unknown,
  ) {
    try {
      const response = await axios({
        method,
        url: `${this.cardServiceBaseUrl}${path}`,
        data,
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status ?? 502;
        const message =
          (error.response?.data as { message?: string } | undefined)?.message ??
          'Unable to reach card service';
        throw new BadGatewayException({
          statusCode: status,
          message,
        });
      }

      throw error;
    }
  }
}
