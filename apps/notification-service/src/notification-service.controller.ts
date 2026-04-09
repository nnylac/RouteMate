import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { NotificationService } from './notification-service.service';
import { Notification } from '../schemas/notification-service-schema';

@ApiTags('Notification Service')
@Controller('notification-service')
export class NotificationServiceController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Notification service is running',
    schema: { example: 'notification service is running' },
  })
  getHello(): string {
    return this.notificationService.getHello();
  }

  @Post('test')
  @ApiOperation({ summary: 'Create a test notification' })
  @ApiResponse({
    status: 201,
    description: 'Test notification created',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'test-user',
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification',
        isRead: false,
        createdAt: '2026-04-09T10:00:00.000Z',
      },
    },
  })
  async createTestNotification(): Promise<Notification> {
    return this.notificationService.createTestNotification();
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({
    status: 200,
    description: 'List of all notifications',
    schema: {
      example: [
        {
          _id: '6614a2f3c9b1234567890abc',
          userId: 'user123',
          type: 'route_disruption',
          title: 'EW Line Disrupted',
          message:
            'Your locked route uses the EW line which is currently disrupted. Please re-search.',
          isRead: false,
          createdAt: '2026-04-09T10:00:00.000Z',
        },
      ],
    },
  })
  async getAllNotifications(
    @Query('userId') userId?: string,
  ): Promise<Notification[]> {
    return this.notificationService.getAllNotifications(userId);
  }

  @Post('notifications')
  @ApiOperation({
    summary:
      'Create a notification directly via HTTP — used by orchestrators as backup to RabbitMQ',
  })
  @ApiBody({
    schema: {
      example: {
        userId: 'user123',
        type: 'route_disruption',
        title: 'EW Line Disrupted',
        message:
          'Your locked route uses the EW line which is currently disrupted.',
        isRead: false,
      },
      properties: {
        userId: { type: 'string', example: 'user123' },
        type: { type: 'string', example: 'route_disruption' },
        title: { type: 'string', example: 'EW Line Disrupted' },
        message: {
          type: 'string',
          example:
            'Your locked route uses the EW line which is currently disrupted.',
        },
        isRead: { type: 'boolean', example: false },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'user123',
        type: 'route_disruption',
        title: 'EW Line Disrupted',
        message:
          'Your locked route uses the EW line which is currently disrupted.',
        isRead: false,
        createdAt: '2026-04-09T10:00:00.000Z',
      },
    },
  })
  async createNotification(
    @Body()
    body: {
      userId: string;
      type: string;
      title: string;
      message: string;
      isRead?: boolean;
    },
  ): Promise<Notification> {
    return this.notificationService.createNotification(body);
  }

  // RabbitMQ consumer — hidden from Swagger since it's AMQP not HTTP
  @ApiExcludeEndpoint()
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
