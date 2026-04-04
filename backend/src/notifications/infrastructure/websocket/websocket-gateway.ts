import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { NotifyAlarmWardRepoPort } from 'src/notifications/application/repository/notify-alarm-ward.repository';
import { NotificationDto } from '../dtos/notification.dto';

type PushEventDto = {
  eventType: 'ALARM_TRIGGERED';
  payload: unknown;
  timestamp: string;
};

@WebSocketGateway({
  namespace: '/ws',
  transports: ['websocket'],
  cors: { origin: '*', credentials: true },
})
export class NotificationsGateway implements NotifyAlarmWardRepoPort {
  constructor() {}

  @WebSocketServer() private server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  @SubscribeMessage('join-ward')
  async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() wardId: string) {
    try {
      if (!wardId) {
        client.disconnect();
        this.logger.debug(`client ${client.id} has no wardId`);
      }

      await client.join(`ward:${wardId}`);

      this.logger.debug(`client ${client.id} joined ward ${wardId}`);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('leave-ward')
  async handleLeave(@ConnectedSocket() client: Socket, @MessageBody() wardId: string) {
    try {
      if (!wardId) {
        client.disconnect();
        this.logger.debug(`client ${client.id} has no wardId`);
      }

      await client.leave(`ward:${wardId}`);

      this.logger.debug(`client ${client.id} left ward ${wardId}`);
    } catch {
      client.disconnect();
    }
  }

  notifyAlarmWard(wardId: string, alarm: NotificationDto): Promise<void> {
    this.server.to(`ward:${wardId}`).emit('push-event', alarm);

    return Promise.resolve();
  }
}
