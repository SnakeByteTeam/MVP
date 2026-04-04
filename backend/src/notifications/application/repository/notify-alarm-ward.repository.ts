import { NotificationDto } from "src/notifications/infrastructure/dtos/notification.dto";

export interface NotifyAlarmWardRepoPort {
  notifyAlarmWard(wardId: string, alarm: NotificationDto): Promise<void>;
}

export const NOTIFY_ALARM_WARD_REPO_PORT = Symbol('NotifyAlarmWardRepoPort');
