import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private activeUsers: Map<string, { socketId: string; userId: string }> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token as string;
      if (!token) {
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }
      const payload = await this.authService.validateToken(token);
      const userId = payload.sub;
      this.activeUsers.set(client.id, { socketId: client.id, userId });
      client.data.userId = userId;
      client.join(`user:${userId}`);
      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    } catch {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.activeUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { message: string; chatId?: string }) {
    try {
      const userId = client.data.userId;
      if (!userId) throw new WsException('Unauthorized');

      this.server.to(`user:${userId}`).emit('aiTyping', { isTyping: true, chatId: payload.chatId });

      const result = await this.chatService.sendMessage(userId, { message: payload.message, chatId: payload.chatId });

      this.server.to(`user:${userId}`).emit('aiTyping', { isTyping: false, chatId: result.chatId });
      this.server.to(`user:${userId}`).emit('newMessage', result);
      return result;
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(client: Socket, chatId: string) {
    client.join(`chat:${chatId}`);
    const messages = await this.chatService.getHistory(client.data.userId, chatId);
    client.emit('chatHistory', messages);
  }

  @SubscribeMessage('typing')
  async handleTyping(client: Socket, payload: { chatId: string; isTyping: boolean }) {
    const userId = client.data.userId;
    client.to(`chat:${payload.chatId}`).emit('userTyping', { userId, isTyping: payload.isTyping });
  }
}
