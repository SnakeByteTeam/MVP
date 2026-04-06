import { Module } from '@nestjs/common';

import { EventNotificationController } from './adapters/in/notification-event.controller';

import { NotificationsService } from './application/services/notifications.service';
import { NotifyAlarmWardAdapter } from './adapters/out/notify-alarm-ward.adapter';
import { NotificationsGateway } from './infrastructure/websocket/websocket-gateway';
import { WriteNotificationAdapter } from './adapters/out/write-notification.adapter';
import { NotificationRepositoryImpl } from './infrastructure/persistance/notification-repository-impl';

import { NOTIFY_ALARM_WARD_USECASE } from './application/ports/in/notify-alarm-ward.usecase';
import { NOTIFY_ALARM_WARD_PORT } from './application/ports/out/notify-alarm-ward.port';
import { NOTIFY_ALARM_WARD_REPO_PORT } from './application/repository/notify-alarm-ward.repository';
import { WRITE_NOTIFICATION_PORT } from './application/ports/out/write-notification.port';
import { WRITE_NOTIFICATION_REPO_PORT } from './application/repository/write-notification.repository';


@Module({
  imports: [],
  controllers: [EventNotificationController],
  providers: [
    NotificationsGateway,
    { provide: NOTIFY_ALARM_WARD_USECASE, useClass: NotificationsService },
    { provide: NOTIFY_ALARM_WARD_PORT, useClass: NotifyAlarmWardAdapter },
    { provide: NOTIFY_ALARM_WARD_REPO_PORT, useExisting: NotificationsGateway },
    { provide: WRITE_NOTIFICATION_PORT, useClass: WriteNotificationAdapter }, 
    { provide: WRITE_NOTIFICATION_REPO_PORT, useClass: NotificationRepositoryImpl }
  ],
})
export class NotificationModule {}
