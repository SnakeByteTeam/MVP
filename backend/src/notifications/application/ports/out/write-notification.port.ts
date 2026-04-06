import { WriteNotificationCmd } from '../../commands/write-notification.command';

export interface WriteNotificationPort {
  writeNotification(cmd: WriteNotificationCmd): Promise<boolean>;
}

export const WRITE_NOTIFICATION_PORT = Symbol('WriteNotificationPort');
