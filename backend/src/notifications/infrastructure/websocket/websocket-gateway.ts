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
import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';
import { NotifyAlarmResolutionRepoPort } from 'src/notifications/application/repository/notify-alarm-resolution.repository';

@WebSocketGateway({
  namespace: '/ws',
  transports: ['websocket'],
  cors: { origin: '*', credentials: true },
})
export class NotificationsGateway
  implements NotifyAlarmWardRepoPort, NotifyAlarmResolutionRepoPort
{
  constructor() {}

  @WebSocketServer() private server!: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  @SubscribeMessage('join-ward')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() wardId: number,
  ) {
    try {
      if (!wardId) {
        client.disconnect();
        this.logger.log(`client ${client.id} has no wardId`);
      }

      await client.join(`ward:${wardId}`);

      this.logger.log(`client ${client.id} joined ward ${wardId}`);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('leave-ward')
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() wardId: number,
  ) {
    try {
      if (!wardId) {
        client.disconnect();
        this.logger.log(`client ${client.id} has no wardId`);
      }

      await client.leave(`ward:${wardId}`);

      this.logger.log(`client ${client.id} left ward ${wardId}`);
    } catch {
      client.disconnect();
    }
  }

  async notifyAlarmWard(
    wardId: number,
    alarm: CheckAlarmRuleResDto,
  ): Promise<void> {
    if (!this.server) {
      this.logger.error('WebSocket server not initialized');
      return;
    }

    this.server.to(`ward:${wardId}`).emit('push-event', alarm);
  }

  async notifyAlarmResolution(alarmId: string, wardId: number): Promise<void> {
    if (!this.server) {
      this.logger.error('WebSocket server not initialized');
      return;
    }

    this.server
      .to(`ward:${wardId}`)
      .emit('alarm-resolved', { alarmEventId: alarmId, wardId: wardId });
  }
}
