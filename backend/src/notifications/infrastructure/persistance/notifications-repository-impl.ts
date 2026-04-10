import { Inject, Injectable } from '@nestjs/common';
import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';
import { NotificationsRepositoryPort } from 'src/notifications/application/repository/notifications.repository';
import { NotificationsGateway } from 'src/notifications/infrastructure/websocket/websocket-gateway';
import { NotificationRepositoryImpl } from 'src/notifications/infrastructure/persistance/notification-repository-impl';

@Injectable()
export class NotificationsRepositoryImpl implements NotificationsRepositoryPort {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationRepository: NotificationRepositoryImpl,
  ) {}

  async notifyAlarmWard(
    wardId: number,
    alarm: CheckAlarmRuleResDto,
  ): Promise<void> {
    return await this.notificationsGateway.notifyAlarmWard(wardId, alarm);
  }

  async notifyAlarmResolution(alarmId: string, wardId: number): Promise<void> {
    return await this.notificationsGateway.notifyAlarmResolution(
      alarmId,
      wardId,
    );
  }

  async writeNotification(
    ward_id: number,
    alarm_id: string,
    timestamp: string,
  ): Promise<boolean> {
    return await this.notificationRepository.writeNotification(
      ward_id,
      alarm_id,
      timestamp,
    );
  }
}
