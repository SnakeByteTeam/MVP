export interface WriteNotificationRepoPort {
  writeNotification(
    ward_id: number,
    alarm_id: string,
    timestamp: string,
  ): Promise<boolean>;
}

export const WRITE_NOTIFICATION_REPO_PORT = Symbol('WriteNotificationRepoPort');
