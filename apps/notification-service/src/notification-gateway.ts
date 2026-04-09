import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`[NotificationGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[NotificationGateway] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() payload: { userId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload?.userId) {
      return;
    }

    const room = `user:${payload.userId}`;
    client.join(room);
    console.log(`[NotificationGateway] Client ${client.id} joined ${room}`);
  }

  emitNotification(userId: string, notification: unknown) {
    this.server.to(`user:${userId}`).emit('notification.created', notification);
  }
}
