import { Module } from '@nestjs/common';

import { EventNotificationController } from './adapters/in/notification-event.controller';

import { NotificationsService } from './application/services/notifications.service';
import { NotificationsAdapter } from './adapters/out/notifications.adapter';
import { NotificationsGateway } from './infrastructure/websocket/websocket-gateway';
import { NotificationRepositoryImpl } from './infrastructure/persistance/notification-repository-impl';
import { NotificationsRepositoryImpl } from './infrastructure/persistance/notifications-repository-impl';

import { NOTIFY_ALARM_WARD_USECASE } from './application/ports/in/notify-alarm-ward.usecase';
import { NOTIFY_ALARM_WARD_PORT } from './application/ports/out/notify-alarm-ward.port';
import { WRITE_NOTIFICATION_PORT } from './application/ports/out/write-notification.port';
import { NOTIFY_ALARM_RESOLUTION_USECASE } from './application/ports/in/notify-alarm-resolution.usecase';
import { NOTIFY_ALARM_RESOLUTION_PORT } from './application/ports/out/notify-alarm-resolution.port';
import { NOTIFICATIONS_REPOSITORY_PORT } from './application/repository/notifications.repository';

@Module({
  imports: [],
  controllers: [EventNotificationController],
  providers: [
    // Use cases
    { provide: NOTIFY_ALARM_WARD_USECASE, useClass: NotificationsService },
    { provide: NOTIFY_ALARM_RESOLUTION_USECASE, useClass: NotificationsService },
    
    // Unified port & adapter
    {
      provide: NOTIFICATIONS_REPOSITORY_PORT,
      useClass: NotificationsRepositoryImpl,
    },
    { provide: NOTIFY_ALARM_WARD_PORT, useClass: NotificationsAdapter },
    { provide: NOTIFY_ALARM_RESOLUTION_PORT, useClass: NotificationsAdapter },
    { provide: WRITE_NOTIFICATION_PORT, useClass: NotificationsAdapter },
    
    // Standalone dependencies
    NotificationsGateway,
    NotificationRepositoryImpl,
    NotificationsRepositoryImpl,
  ],
})
export class NotificationModule {}
