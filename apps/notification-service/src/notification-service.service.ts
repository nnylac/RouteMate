import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../schemas/notification-service-schema';
import { NotificationGateway } from './notification-gateway';

interface NotificationEventPayload {
  event?: string;
  userId?: string | number;
  cardId?: string;
  amount?: number;
  balance?: number;
  failureReason?: string;
}

interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead?: boolean;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  getHello(): string {
    return 'notification service is running';
  }

  async createTestNotification(): Promise<Notification> {
    return this.createNotification({
      userId: 'user_001',
      type: 'card_low_balance',
      title: 'Low Card Balance',
      message: 'Your card balance has fallen below the threshold.',
      isRead: false,
    });
  }

  async getAllNotifications(userId?: string): Promise<Notification[]> {
    const query = userId ? { userId } : {};
    return this.notificationModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async createFromEvent(
    payload: NotificationEventPayload,
  ): Promise<Notification | null> {
    if (payload.userId === undefined || payload.userId === null) {
      return null;
    }

    const userId = String(payload.userId);
    const amountLabel =
      typeof payload.amount === 'number'
        ? `$${payload.amount.toFixed(2)}`
        : null;
    const balanceLabel =
      typeof payload.balance === 'number'
        ? `$${payload.balance.toFixed(2)}`
        : null;

    const notificationContent = this.mapEventToNotification(
      payload,
      amountLabel,
      balanceLabel,
    );
    if (!notificationContent) {
      return null;
    }

    return this.createNotification({
      userId,
      type: notificationContent.type,
      title: notificationContent.title,
      message: notificationContent.message,
      isRead: false,
    });
  }

  async createNotification(
    input: CreateNotificationInput,
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      isRead: input.isRead ?? false,
    });

    const savedNotification = await notification.save();
    this.notificationGateway.emitNotification(input.userId, savedNotification);

    return savedNotification;
  }

  private mapEventToNotification(
    payload: NotificationEventPayload,
    amountLabel: string | null,
    balanceLabel: string | null,
  ) {
    switch (payload.event) {
      case 'card.topup.success':
        return {
          type: 'card_topup_success',
          title: 'Top-Up Successful',
          message:
            amountLabel && balanceLabel
              ? `Top-up of ${amountLabel} completed. Updated balance: ${balanceLabel}.`
              : amountLabel
                ? `Card top-up successful for ${amountLabel}.`
                : 'Card top-up successful.',
        };
      case 'card.topup.failed':
        return {
          type: 'card_topup_failed',
          title: 'Top-Up Failed',
          message: payload.failureReason
            ? `Card top-up failed: ${payload.failureReason}.`
            : 'Card top-up failed.',
        };
      case 'card.topup.rollback':
        return {
          type: 'card_topup_rollback',
          title: 'Top-Up Reversed',
          message:
            amountLabel && balanceLabel
              ? `Top-up of ${amountLabel} was rolled back. Balance remains ${balanceLabel}.`
              : amountLabel
                ? `Card top-up for ${amountLabel} was rolled back.`
                : 'Card top-up was rolled back.',
        };
      case 'card.deduction.success':
        return {
          type: 'card_deduction_success',
          title: 'Fare Deducted',
          message:
            amountLabel && balanceLabel
              ? `${amountLabel} was deducted. Updated balance: ${balanceLabel}.`
              : amountLabel
                ? `Fare deduction successful for ${amountLabel}.`
                : 'Fare deduction successful.',
        };
      case 'card.deduction.failed':
        return {
          type: 'card_deduction_failed',
          title: 'Fare Deduction Failed',
          message: payload.failureReason
            ? `Fare deduction failed: ${payload.failureReason}.`
            : 'Fare deduction failed.',
        };
      default:
        return null;
    }
  }
}
