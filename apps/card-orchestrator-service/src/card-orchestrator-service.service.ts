import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

type TransactionType = 'top_up' | 'payment' | 'refund';

interface CardServiceCard {
  _id?: string;
  id?: string;
  userId?: string;
  user_id?: string;
  balance?: number;
}

@Injectable()
export class CardOrchestratorServiceService {
  private readonly cardServiceBaseUrl =
    process.env.CARD_SERVICE_URL ?? 'http://localhost:3002/card-service';
  private readonly transactionApiCreateUrl =
    process.env.TRANSACTION_API_CREATE_URL ??
    'https://personal-1pnhiqon.outsystemscloud.com/Payment/rest/TransactionAPI/CreateTransaction';

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

    await this.recordTransaction(updatedCard, amount, 'top_up');

    return updatedCard;
  }

  async deductFare(id: string, amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }

    const updatedCard = await this.forwardRequest(
      'patch',
      `/cards/${id}/deduct`,
      { amount },
    );

    await this.recordTransaction(updatedCard, amount, 'payment');

    return updatedCard;
  }

  private async recordTransaction(
    cardResponse: CardServiceCard,
    amount: number,
    transactionType: TransactionType,
  ) {
    const cardId = cardResponse?._id ?? cardResponse?.id;
    const userId = cardResponse?.userId ?? cardResponse?.user_id;

    if (!cardId || !userId) {
      return;
    }

    const payload = {
      userId,
      cardId,
      transactionType,
      amount: amount.toFixed(2),
      status: 'success',
      reference: `${transactionType}_${cardId}_${Date.now()}`,
    };

    try {
      await axios.post(this.transactionApiCreateUrl, payload);
    } catch (error) {
      console.warn(
        'Transaction API call failed:',
        error instanceof AxiosError ? error.response?.data ?? error.message : error,
      );
    }
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
