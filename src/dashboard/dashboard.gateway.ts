import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { DashboardService } from './dashboard.service';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/dashboard',
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DashboardGateway.name);

  constructor(
    private readonly dashboardService: DashboardService,
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
      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
      this.logger.log(`Dashboard client connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Dashboard client disconnected: ${client.id}`);
  }

  @SubscribeMessage('getStats')
  async handleGetStats(client: Socket) {
    try {
      const userId = client.data.userId;
      if (!userId) return;
      const stats = await this.dashboardService.getStats(userId);
      client.emit('stats', stats);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('getActivity')
  async handleGetActivity(client: Socket) {
    try {
      const userId = client.data.userId;
      if (!userId) return;
      const activity = await this.dashboardService.getActivity(userId);
      client.emit('activity', activity);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('getRecommendations')
  async handleGetRecommendations(client: Socket) {
    try {
      const userId = client.data.userId;
      if (!userId) return;
      const recommendations = await this.dashboardService.getRecommendations(userId);
      client.emit('recommendations', recommendations);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
