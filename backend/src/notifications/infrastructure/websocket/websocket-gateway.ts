import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotifyAlarmWardRepoPort } from 'src/notifications/application/repository/notify-alarm-ward.repository';

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

    constructor(
        private readonly jwtService: JwtService
    ) {}

  @WebSocketServer() private server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);


  @SubscribeMessage('join-ward')
  async handleJoin(@ConnectedSocket() client: Socket) {
    try{
        const token = client.handshake.auth?.token;
        if(!token) client.disconnect();

        const payload = this.jwtService.verify(token);
        const wardId = payload?.wardId;

        if(!wardId) {
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
  async handleLeave(@ConnectedSocket() client: Socket) {
    try {
        const token = client.handshake.auth?.token;
        if(!token) client.disconnect();

        const payload = this.jwtService.verify(token);
        const wardId = payload?.wardId;

        if(!wardId) {
            client.disconnect();
            this.logger.debug(`client ${client.id} has no wardId`);
        }

        await client.leave(`ward:${wardId}`);

        this.logger.debug(`client ${client.id} left ward ${wardId}`);
    } catch {
        client.disconnect();
    }
  }

  notifyAlarmWard(wardId: string, alarm: AlarmEventDto): Promise<void> {
      this.server.to(`ward:${wardId}`).emit('push-event', alarm);

      return Promise.resolve();
  }
}