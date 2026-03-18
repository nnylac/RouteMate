import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../schemas/notification-service-schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  getHello(): string {
    return 'notification service is running';
  }

  async createTestNotification(): Promise<Notification> {
    const notification = new this.notificationModel({
      userId: 'user_001',
      type: 'card_low_balance',
      title: 'Low Card Balance',
      message: 'Your card balance has fallen below the threshold.',
      isRead: false,
    });

    return notification.save();
  }

  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationModel.find().exec();
  }
}
