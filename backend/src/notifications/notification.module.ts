import { Module } from '@nestjs/common';

import { EventNotificationController } from './adapters/in/notification-event.controller';

import { NotificationsService } from './application/services/notifications.service';
import { NotifyAlarmWardAdapter } from './adapters/out/notify-alarm-ward.adapter';
import { NotificationsGateway } from './infrastructure/websocket/websocket-gateway';
import { WriteNotificationAdapter } from './adapters/out/write-notification.adapter';
import { NotificationRepositoryImpl } from './infrastructure/persistance/notification-repository-impl';
import { NotifyAlarmResolutionAdapter } from './adapters/out/notify-alarm-resolution.adapter';

import { NOTIFY_ALARM_WARD_USECASE } from './application/ports/in/notify-alarm-ward.usecase';
import { NOTIFY_ALARM_WARD_PORT } from './application/ports/out/notify-alarm-ward.port';
import { NOTIFY_ALARM_WARD_REPO_PORT } from './application/repository/notify-alarm-ward.repository';
import { WRITE_NOTIFICATION_PORT } from './application/ports/out/write-notification.port';
import { WRITE_NOTIFICATION_REPO_PORT } from './application/repository/write-notification.repository';
import { NOTIFY_ALARM_RESOLUTION_USECASE } from './application/ports/in/notify-alarm-resolution.usecase';
import { NOTIFY_ALARM_RESOLUTION_PORT } from './application/ports/out/notify-alarm-resolution.port';
import { NOTIFY_ALARM_RESOLUTION_REPO_PORT } from './application/repository/notify-alarm-resolution.repository';

@Module({
  imports: [],
  controllers: [EventNotificationController],
  providers: [
    NotificationsGateway,
    { provide: NOTIFY_ALARM_WARD_USECASE, useClass: NotificationsService },
    { provide: NOTIFY_ALARM_WARD_PORT, useClass: NotifyAlarmWardAdapter },
    { provide: NOTIFY_ALARM_WARD_REPO_PORT, useExisting: NotificationsGateway },
    { provide: WRITE_NOTIFICATION_PORT, useClass: WriteNotificationAdapter },
    {
      provide: WRITE_NOTIFICATION_REPO_PORT,
      useClass: NotificationRepositoryImpl,
    },
    {
      provide: NOTIFY_ALARM_RESOLUTION_USECASE,
      useClass: NotificationsService,
    },
    {
      provide: NOTIFY_ALARM_RESOLUTION_PORT,
      useClass: NotifyAlarmResolutionAdapter,
    },
    {
      provide: NOTIFY_ALARM_RESOLUTION_REPO_PORT,
      useExisting: NotificationsGateway,
    },
  ],
})
export class NotificationModule {}
