import { Inject, Injectable } from '@nestjs/common';
import { NotifyAlarmWardUseCase } from '../ports/in/notify-alarm-ward.usecase';
import { NotifyAlarmWardCmd } from '../commands/notify-alarm-ward.command';
import {
  NOTIFY_ALARM_WARD_PORT,
  type NotifyAlarmWardPort,
} from '../ports/out/notify-alarm-ward.port';
import {
  WRITE_NOTIFICATION_PORT,
  type WriteNotificationPort,
} from '../ports/out/write-notification.port';
import { timestamp } from 'rxjs';

@Injectable()
export class NotificationsService implements NotifyAlarmWardUseCase {
  constructor(
    @Inject(NOTIFY_ALARM_WARD_PORT)
    private readonly notifyPort: NotifyAlarmWardPort,
    @Inject(WRITE_NOTIFICATION_PORT)
    private readonly writeNotificationPort: WriteNotificationPort,
  ) {}

  async notifyAlarmWard(cmd: NotifyAlarmWardCmd): Promise<void> {
    await this.notifyPort.notifyAlarmWard(cmd);

    if(!cmd.alarm.alarm_event_id) throw new Error('Can\'t write notification without alarm event id');

    const timeNow: string = new Date(Date.now()).toISOString();

    await this.writeNotificationPort.writeNotification({
      alarm_event_id: cmd.alarm.alarm_event_id,
      timestamp: timeNow,
      ward_id: cmd.alarm.ward_id,
    });
  }
}
