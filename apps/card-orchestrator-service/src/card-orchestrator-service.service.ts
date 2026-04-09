import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { RabbitMQPublisher } from './rabbitmq.publisher';

type TransactionType = 'top_up' | 'payment' | 'refund';
type TransactionStatus = 'pending' | 'success' | 'failed' | 'rolled_back';

interface OutsystemsTransaction {
  Id: number;
  UserId: string | number;
  TransactionType: string;
  CardId: string;
  Amount: number;
  Status: string;
  Reference?: string;
  PaymentReference?: string;
  FailureReason?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

@Injectable()
export class CardOrchestratorServiceService {
  private readonly cardServiceBaseUrl =
    process.env.CARD_SERVICE_URL ?? 'http://localhost:3002/card-service';
  private readonly transactionApiBaseUrl =
    process.env.TRANSACTION_API_BASE_URL ??
    'https://personal-1pnhiqon.outsystemscloud.com/Payment/rest/TransactionAPI';

  constructor(private readonly publisher: RabbitMQPublisher) {}

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

    return this.forwardRequest('patch', `/cards/${id}/topup`, {
      amount,
    });
  }

  async deductFare(id: string, amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }

    const updatedCard = await this.forwardRequest('patch', `/cards/${id}/deduct`, {
      amount,
    });

    const userId = await this.getUserIdForCard(id);
    if (userId !== null) {
      void this.publisher.publishDeductionSuccess({
        cardId: id,
        userId,
        amount,
      });
    }

    return updatedCard;
  }

  async createTransaction(body: {
    userId: string | number;
    cardId: string;
    amount: number;
    transactionType: TransactionType;
    status: TransactionStatus;
    reference?: string;
    paymentReference?: string;
    failureReason?: string;
  }) {
    if (!body.userId && body.userId !== 0) {
      throw new BadRequestException('userId is required');
    }

    if (!body.cardId) {
      throw new BadRequestException('cardId is required');
    }

    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }

    try {
      const reference =
        body.reference ?? `${body.transactionType}_${body.cardId}_${Date.now()}`;
      const response = await axios.post<OutsystemsTransaction>(
        `${this.transactionApiBaseUrl}/transactions`,
        {
          Id: 0,
          UserId: body.userId,
          TransactionType: body.transactionType,
          CardId: body.cardId,
          Amount: body.amount,
          Status: body.status,
          Reference: reference,
          PaymentReference: body.paymentReference ?? '',
          FailureReason: body.failureReason ?? '',
        },
      );

      if (response.data?.Id && response.data.Id > 0) {
        return response.data;
      }

      const recoveredTransaction = await this.findTransactionByReference(
        response.data?.UserId ?? body.userId,
        body.cardId,
        reference,
      );

      if (recoveredTransaction) {
        return recoveredTransaction;
      }

      return {
        ...response.data,
        Reference: reference,
        syncWarning: 'Transaction API did not return a valid transaction id',
      };
    } catch (error) {
      throw this.toGatewayError(error, 'Unable to create transaction');
    }
  }

  async updateTransactionStatus(
    transactionId: number,
    body: {
      status: TransactionStatus;
      failureReason?: string;
      transactionType?: TransactionType;
      cardId?: string;
      userId?: string | number;
      amount?: number;
    },
  ) {
    if (!transactionId) {
      throw new BadRequestException('transactionId is required');
    }

    try {
      const response = await axios.patch<OutsystemsTransaction>(
        `${this.transactionApiBaseUrl}/transactions/${transactionId}/status`,
        {
          Id: transactionId,
          Status: body.status,
          Order: 0,
          Is_Active: true,
        },
      );

      if (body.failureReason) {
        const responseWithFailure = {
          ...response.data,
          FailureReason: body.failureReason,
        };

        this.publishStatusEvent(body.status, responseWithFailure, body);
        return responseWithFailure;
      }

      this.publishStatusEvent(body.status, response.data, body);
      return response.data;
    } catch (error) {
      throw this.toGatewayError(error, 'Unable to update transaction status');
    }
  }

  async publishTopUpFailedEvent(body: {
    cardId: string;
    userId: string | number;
    amount: number;
    failureReason?: string;
    transactionId?: number;
  }) {
    await this.publisher.publishTopUpFailed(body);
    return { success: true };
  }

  async publishTopUpRolledBackEvent(body: {
    cardId: string;
    userId: string | number;
    amount: number;
    failureReason?: string;
    transactionId?: number;
  }) {
    await this.publisher.publishTopUpRolledBack(body);
    return { success: true };
  }

  async getTransactionsRecords(userId: string | number, cardId: string) {
    if (!cardId) {
      throw new BadRequestException('cardId is required');
    }

    try {
      const response = await axios.get<OutsystemsTransaction[]>(
        `${this.transactionApiBaseUrl}/transactions/${userId}/${cardId}`,
      );
      return response.data;
    } catch (error) {
      throw this.toGatewayError(error, 'Unable to get transactions');
    }
  }

  private async findTransactionByReference(
    userId: string | number,
    cardId: string,
    reference: string,
  ) {
    const candidateUserIds = [...new Set([userId, 0, '0'])];

    for (const candidateUserId of candidateUserIds) {
      try {
        const response = await axios.get<OutsystemsTransaction[]>(
          `${this.transactionApiBaseUrl}/transactions/${candidateUserId}/${cardId}`,
        );
        const match = response.data
          .filter((transaction) => transaction.Reference === reference && transaction.Id > 0)
          .sort((left, right) => right.Id - left.Id)[0];

        if (match) {
          return match;
        }
      } catch {
        // Keep trying other candidate user ids before giving up.
      }
    }

    return null;
  }

  private toGatewayError(error: unknown, fallbackMessage: string) {
    if (error instanceof AxiosError) {
      const status = error.response?.status ?? 502;
      const payload = error.response?.data as
        | { message?: string; Message?: string }
        | string
        | undefined;
      const message =
        typeof payload === 'string'
          ? payload
          : payload?.message ?? payload?.Message ?? fallbackMessage;

      return new BadGatewayException({
        statusCode: status,
        message,
      });
    }

    return error;
  }

  private async getUserIdForCard(cardId: string) {
    try {
      const card = await this.getCardById(cardId);
      const userId = (card as { userId?: string | number } | null)?.userId;
      return userId ?? null;
    } catch {
      return null;
    }
  }

  private publishStatusEvent(
    status: TransactionStatus,
    transaction: Partial<OutsystemsTransaction>,
    context?: {
      transactionType?: TransactionType;
      cardId?: string;
      userId?: string | number;
      amount?: number;
      failureReason?: string;
    },
  ) {
    const cardId = transaction.CardId ?? context?.cardId;
    const userId = transaction.UserId ?? context?.userId;
    const amount = transaction.Amount ?? context?.amount;
    const transactionType = transaction.TransactionType ?? context?.transactionType;
    const failureReason = transaction.FailureReason ?? context?.failureReason;

    if (!cardId || userId === undefined || userId === null || typeof amount !== 'number') {
      return;
    }

    if (transactionType !== 'top_up' && transactionType !== 'payment') {
      return;
    }

    if (transactionType === 'top_up') {
      if (status === 'success') {
        void this.publisher.publishTopUpSuccess({
          cardId,
          userId,
          amount,
          transactionId: transaction.Id,
        });
      } else if (status === 'failed') {
        void this.publisher.publishTopUpFailed({
          cardId,
          userId,
          amount,
          failureReason,
          transactionId: transaction.Id,
        });
      } else if (status === 'rolled_back') {
        void this.publisher.publishTopUpRolledBack({
          cardId,
          userId,
          amount,
          failureReason,
          transactionId: transaction.Id,
        });
      }
    } else if (transactionType === 'payment' && status === 'failed') {
      void this.publisher.publishDeductionFailed({
        cardId,
        userId,
        amount,
        failureReason,
        transactionId: transaction.Id,
      });
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
