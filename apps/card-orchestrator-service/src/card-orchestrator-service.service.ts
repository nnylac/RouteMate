import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { RabbitMQPublisher } from './rabbitmq.publisher';

type TransactionType = 'top_up' | 'payment' | 'refund';
type TransactionStatus = 'pending' | 'success' | 'failed' | 'rolled_back';

interface PaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string | null;
  status: string;
  amount: number;
  currency: string;
}

interface PaymentConfirmationResponse {
  paymentIntentId: string;
  status: string;
}

interface RefundResponse {
  refundId: string;
  status: string;
  amount: number;
  currency: string;
}

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
  private readonly paymentWrapperBaseUrl =
    process.env.PAYMENT_WRAPPER_URL ?? 'http://localhost:3007/payment';
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

  async topUpCard(
    id: string,
    amount: number,
    context?: {
      transactionUserId?: string | number;
      appUserId?: string;
    },
  ) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }

    if (!context?.transactionUserId && context?.transactionUserId !== 0) {
      throw new BadRequestException('transactionUserId is required');
    }

    let transactionId: number | null = null;
    let paymentIntentId: string | null = null;
    let transactionSyncWarning = false;
    let paymentSucceeded = false;

    try {
      const transaction = await this.createTransaction({
        userId: context.transactionUserId,
        cardId: id,
        amount,
        transactionType: 'top_up',
        status: 'pending',
      });

      if (transaction.Id && transaction.Id > 0) {
        transactionId = transaction.Id;
      } else {
        transactionSyncWarning = true;
      }

      const paymentIntent = await this.createPaymentIntent({
        amount,
        currency: 'sgd',
        metadata: {
          userId: String(context.transactionUserId),
          cardId: id,
          transactionId:
            transactionId !== null ? String(transactionId) : 'pending-sync',
        },
      });

      paymentIntentId = paymentIntent.paymentIntentId;

      const confirmation = await this.confirmPaymentIntent({
        paymentIntentId,
        paymentMethod: 'pm_card_visa',
      });

      if (confirmation.status !== 'succeeded') {
        throw new Error(`Payment failed with status: ${confirmation.status}`);
      }

      paymentSucceeded = true;

      const updatedCard = await this.forwardRequest(
        'patch',
        `/cards/${id}/topup`,
        {
          amount,
        },
      );

      if (transactionId !== null) {
        try {
          await this.updateTransactionStatus(transactionId, {
            status: 'success',
            transactionType: 'top_up',
            cardId: id,
            userId: context.appUserId ?? context.transactionUserId,
            amount,
            balance:
              typeof (updatedCard as { balance?: unknown })?.balance ===
              'number'
                ? (updatedCard as { balance: number }).balance
                : undefined,
          });
        } catch {
          transactionSyncWarning = true;
        }
      }

      return {
        ...(updatedCard as object),
        transactionId: transactionId ?? undefined,
        transactionWarning: transactionSyncWarning
          ? 'Top-up succeeded, but transaction status could not be synced.'
          : undefined,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to top up card';

      if (paymentSucceeded && paymentIntentId) {
        try {
          const refund = await this.createRefund({
            paymentIntentId,
            amount,
          });

          if (refund.status !== 'succeeded') {
            throw new Error(`Refund failed with status: ${refund.status}`);
          }

          if (transactionId !== null) {
            try {
              await this.updateTransactionStatus(transactionId, {
                status: 'rolled_back',
                failureReason: message,
                transactionType: 'top_up',
                cardId: id,
                userId: context.appUserId ?? context.transactionUserId,
                amount,
              });
            } catch {
              // Preserve the original rollback reason if transaction sync fails.
            }
          }

          throw new BadGatewayException(
            'Top-up could not be applied to your card. Your Stripe payment was refunded.',
          );
        } catch (refundError) {
          const refundMessage =
            refundError instanceof Error
              ? refundError.message
              : 'Payment succeeded, but refund failed.';

          if (transactionId !== null) {
            try {
              await this.updateTransactionStatus(transactionId, {
                status: 'failed',
                failureReason: `${message} Refund error: ${refundMessage}`,
                transactionType: 'top_up',
                cardId: id,
                userId: context.appUserId ?? context.transactionUserId,
                amount,
              });
            } catch {
              // Preserve the original refund failure if transaction sync fails.
            }
          }

          throw new BadGatewayException(
            `Payment was charged, but refund failed. ${refundMessage}`,
          );
        }
      }

      if (transactionId !== null) {
        try {
          await this.updateTransactionStatus(transactionId, {
            status: 'failed',
            failureReason: message,
            transactionType: 'top_up',
            cardId: id,
            userId: context.appUserId ?? context.transactionUserId,
            amount,
          });
        } catch {
          // Preserve the original top-up failure if transaction sync fails.
        }
      }

      throw error;
    }
  }

  async deductFare(
    id: string,
    amount: number,
    context?: {
      transactionUserId?: string | number;
      appUserId?: string;
      reference?: string;
    },
  ) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }

    if (context) {
      if (!context.transactionUserId && context.transactionUserId !== 0) {
        throw new BadRequestException('transactionUserId is required');
      }

      let transactionId: number | null = null;
      let transactionSyncWarning = false;

      try {
        const transaction = await this.createTransaction({
          userId: context.transactionUserId,
          cardId: id,
          amount,
          transactionType: 'payment',
          status: 'pending',
          reference: context.reference,
        });

        if (!transaction.Id || transaction.Id <= 0) {
          throw new BadGatewayException('Unable to create journey transaction');
        }

        transactionId = transaction.Id;

        const updatedCard = await this.forwardRequest(
          'patch',
          `/cards/${id}/deduct`,
          {
            amount,
          },
        );

        try {
          await this.updateTransactionStatus(transactionId, {
            status: 'success',
            transactionType: 'payment',
            cardId: id,
            userId: context.appUserId ?? context.transactionUserId,
            amount,
            balance:
              typeof (updatedCard as { balance?: unknown })?.balance ===
              'number'
                ? (updatedCard as { balance: number }).balance
                : undefined,
          });
        } catch {
          transactionSyncWarning = true;
        }

        return {
          ...(updatedCard as object),
          transactionId,
          transactionWarning: transactionSyncWarning
            ? 'Journey completed, but transaction status could not be synced.'
            : undefined,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to deduct fare';

        if (transactionId !== null) {
          try {
            await this.updateTransactionStatus(transactionId, {
              status: 'failed',
              failureReason: message,
              transactionType: 'payment',
              cardId: id,
              userId: context.appUserId ?? context.transactionUserId,
              amount,
            });
          } catch {
            // Preserve the original deduction error if transaction sync fails.
          }
        }

        throw error;
      }
    }

    const updatedCard = await this.forwardRequest(
      'patch',
      `/cards/${id}/deduct`,
      {
        amount,
      },
    );

    const userId = await this.getUserIdForCard(id);
    if (userId !== null) {
      void this.publisher.publishDeductionSuccess({
        cardId: id,
        userId,
        amount,
        balance:
          typeof (updatedCard as { balance?: unknown })?.balance === 'number'
            ? (updatedCard as { balance: number }).balance
            : undefined,
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
        body.reference ??
        `${body.transactionType}_${body.cardId}_${Date.now()}`;
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
      balance?: number;
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
          .filter(
            (transaction) =>
              transaction.Reference === reference && transaction.Id > 0,
          )
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
          : (payload?.message ?? payload?.Message ?? fallbackMessage);

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

  private async createPaymentIntent(body: {
    amount: number;
    currency?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const response = await axios.post<PaymentIntentResponse>(
        `${this.paymentWrapperBaseUrl}/intent`,
        body,
      );
      return response.data;
    } catch (error) {
      throw this.toGatewayError(error, 'Unable to create payment intent');
    }
  }

  private async confirmPaymentIntent(body: {
    paymentIntentId: string;
    paymentMethod?: string;
  }) {
    try {
      const response = await axios.post<PaymentConfirmationResponse>(
        `${this.paymentWrapperBaseUrl}/confirm`,
        body,
      );
      return response.data;
    } catch (error) {
      throw this.toGatewayError(error, 'Unable to confirm payment');
    }
  }

  private async createRefund(body: {
    paymentIntentId: string;
    amount?: number;
  }) {
    try {
      const response = await axios.post<RefundResponse>(
        `${this.paymentWrapperBaseUrl}/refund`,
        body,
      );
      return response.data;
    } catch (error) {
      throw this.toGatewayError(error, 'Unable to create refund');
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
      balance?: number;
      failureReason?: string;
    },
  ) {
    const cardId = transaction.CardId ?? context?.cardId;
    const userId = transaction.UserId ?? context?.userId;
    const amount = transaction.Amount ?? context?.amount;
    const balance = context?.balance;
    const transactionType =
      transaction.TransactionType ?? context?.transactionType;
    const failureReason = transaction.FailureReason ?? context?.failureReason;

    if (
      !cardId ||
      userId === undefined ||
      userId === null ||
      typeof amount !== 'number'
    ) {
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
          balance,
          transactionId: transaction.Id,
        });
      } else if (status === 'failed') {
        void this.publisher.publishTopUpFailed({
          cardId,
          userId,
          amount,
          balance,
          failureReason,
          transactionId: transaction.Id,
        });
      } else if (status === 'rolled_back') {
        void this.publisher.publishTopUpRolledBack({
          cardId,
          userId,
          amount,
          balance,
          failureReason,
          transactionId: transaction.Id,
        });
      }
    } else if (transactionType === 'payment') {
      if (status === 'success') {
        void this.publisher.publishDeductionSuccess({
          cardId,
          userId,
          amount,
          balance,
          transactionId: transaction.Id,
        });
      } else if (status === 'failed') {
        void this.publisher.publishDeductionFailed({
          cardId,
          userId,
          amount,
          balance,
          failureReason,
          transactionId: transaction.Id,
        });
      }
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
