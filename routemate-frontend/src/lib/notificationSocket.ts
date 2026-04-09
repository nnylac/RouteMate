import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectNotificationSocket(userId: string) {
  if (!userId) return null;

  if (!socket) {
    socket = io('http://localhost:3006', {
      transports: ['websocket'],
    });
  }

  socket.emit('join', { userId });
  return socket;
}

export function getNotificationSocket() {
  return socket;
}

export function disconnectNotificationSocket() {
  socket?.disconnect();
  socket = null;
}
