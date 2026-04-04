export interface WriteNotificationPort {
  writeNotification(): Promise<boolean>;
}

export const WRITE_NOTIFICATION_PORT = Symbol('WriteNotificationPort');
