import { Inject, Injectable } from '@nestjs/common';
import { WriteNotificationCmd } from 'src/notifications/application/commands/write-notification.command';
import { WriteNotificationPort } from 'src/notifications/application/ports/out/write-notification.port';
import {
  WRITE_NOTIFICATION_REPO_PORT,
  type WriteNotificationRepoPort,
} from 'src/notifications/application/repository/write-notification.repository';

@Injectable()
export class WriteNotificationAdapter implements WriteNotificationPort {
  constructor(
    @Inject(WRITE_NOTIFICATION_REPO_PORT)
    private readonly writeNotificationRepoPort: WriteNotificationRepoPort,
  ) {}

  async writeNotification(cmd: WriteNotificationCmd): Promise<boolean> {
    if (!cmd?.alarm_event_id || !cmd?.timestamp || cmd?.ward_id == null)
      throw new Error("Can' write notification without parameteres");

    if (
      !(await this.writeNotificationRepoPort.writeNotification(
        cmd.ward_id,
        cmd.alarm_event_id,
        cmd.timestamp,
      ))
    )
      return false;

    return true;
  }
}
