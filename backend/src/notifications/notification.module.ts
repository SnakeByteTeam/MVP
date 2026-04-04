import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { EventNotificationController } from './adapters/in/notification-event.controller';

import { NotificationService } from './application/services/notification.service';
import { NotifyAlarmWardAdapter } from './adapters/out/notify-alarm-ward.adapter';
import { NotificationsGateway } from './infrastructure/websocket/websocket-gateway';

import { NOTIFY_ALARM_WARD_USECASE } from './application/ports/in/notify-alarm-ward.usecase';
import { NOTIFY_ALARM_WARD_PORT } from './application/ports/out/notify-alarm-ward.port';
import { NOTIFY_ALARM_WARD_REPO_PORT } from './application/repository/notify-alarm-ward.repository';


@Module({
  imports: [],
  controllers: [EventNotificationController],
  providers: [
    {provide: NOTIFY_ALARM_WARD_USECASE,      useClass: NotificationService},
    {provide: NOTIFY_ALARM_WARD_PORT,         useClass: NotifyAlarmWardAdapter},
    {provide: NOTIFY_ALARM_WARD_REPO_PORT,    useClass: NotificationsGateway}
  ]
})
export class NotificationModule {}
