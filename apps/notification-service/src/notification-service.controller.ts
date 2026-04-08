import { Controller, Get, Post, Body } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
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

  // HTTP endpoint — called directly by orchestrator as backup
  @Post('notifications')
  async createNotification(
    @Body() body: {
      userId: string;
      type: string;
      title: string;
      message: string;
      isRead?: boolean;
    },
  ): Promise<Notification> {
    return this.notificationService.createNotification(body);
  }

  // RabbitMQ consumer — listens for route.disrupted event
  @EventPattern('route.disrupted')
  async handleRouteDisrupted(@Payload() data: any) {
    console.log('Received route.disrupted event:', data);
    await this.notificationService.createNotification({
      userId: String(data.user_id),
      type: 'route_disruption',
      title: `${data.disrupted_line} Line Disrupted`,
      message: data.message,
      isRead: false,
    });
  }
}