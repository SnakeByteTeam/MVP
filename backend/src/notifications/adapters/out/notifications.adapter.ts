import { Inject, Injectable } from '@nestjs/common';
import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';
import { NotifyAlarmResolutionCmd } from 'src/notifications/application/commands/notify-alarm-resolution.command';
import { NotifyAlarmWardCmd } from 'src/notifications/application/commands/notify-alarm-ward.command';
import { WriteNotificationCmd } from 'src/notifications/application/commands/write-notification.command';
import { NotifyAlarmResolutionPort } from 'src/notifications/application/ports/out/notify-alarm-resolution.port';
import { NotifyAlarmWardPort } from 'src/notifications/application/ports/out/notify-alarm-ward.port';
import { WriteNotificationPort } from 'src/notifications/application/ports/out/write-notification.port';
import {
  NOTIFICATIONS_REPOSITORY_PORT,
  type NotificationsRepositoryPort,
} from 'src/notifications/application/repository/notifications.repository';

@Injectable()
export class NotificationsAdapter
  implements
    NotifyAlarmWardPort,
    NotifyAlarmResolutionPort,
    WriteNotificationPort
{
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY_PORT)
    private readonly notificationsRepository: NotificationsRepositoryPort,
  ) {}

  async notifyAlarmWard(cmd: NotifyAlarmWardCmd): Promise<void> {
    if (!cmd?.alarm)
      throw new Error('Cannot notify alarm ward without informations');

    const checkAlarmDto: CheckAlarmRuleResDto = CheckAlarmRuleResDto.fromDomain(
      cmd.alarm,
    );

    return this.notificationsRepository.notifyAlarmWard(
      cmd.alarm.ward_id,
      checkAlarmDto,
    );
  }

  async notifyAlarmResolution(cmd: NotifyAlarmResolutionCmd): Promise<void> {
    return await this.notificationsRepository.notifyAlarmResolution(
      cmd.alarmId,
      cmd.wardId,
    );
  }

  async writeNotification(cmd: WriteNotificationCmd): Promise<boolean> {
    if (!cmd?.alarm_event_id || !cmd?.timestamp || cmd?.ward_id == null)
      throw new Error("Can' write notification without parameteres");

    if (
      !(await this.notificationsRepository.writeNotification(
        cmd.ward_id,
        cmd.alarm_event_id,
        cmd.timestamp,
      ))
    )
      return false;

    return true;
  }
}
