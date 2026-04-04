import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';

export interface NotifyAlarmWardRepoPort {
  notifyAlarmWard(wardId: number, alarm: CheckAlarmRuleResDto): Promise<void>;
}

export const NOTIFY_ALARM_WARD_REPO_PORT = Symbol('NotifyAlarmWardRepoPort');
