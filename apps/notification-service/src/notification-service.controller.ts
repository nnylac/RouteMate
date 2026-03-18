import { Controller, Get, Post } from '@nestjs/common';
import { NotificationService } from './notification-service.service';
import { Notification } from '../schemas/notification-service-schema';

@Controller('notification-service')
export class NotificationServiceController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getHello(): string {
    return this.notificationService.getHello();
  }

  @Post('test')
  async createTestNotification(): Promise<Notification> {
    return this.notificationService.createTestNotification();
  }

  @Get('notifications')
  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationService.getAllNotifications();
  }
}
