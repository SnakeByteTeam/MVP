import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';

export interface NotificationsRepositoryPort {
  notifyAlarmWard(wardId: number, alarm: CheckAlarmRuleResDto): Promise<void>;
  notifyAlarmResolution(alarmId: string, wardId: number): Promise<void>;
  writeNotification(
    ward_id: number,
    alarm_id: string,
    timestamp: string,
  ): Promise<boolean>;
}

export const NOTIFICATIONS_REPOSITORY_PORT = Symbol(
  'NotificationsRepositoryPort',
);
