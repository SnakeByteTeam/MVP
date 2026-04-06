import { CheckAlarmEntity } from 'src/alarms/infrastructure/entities/check-alarm-entity';

export interface CheckAlarmRuleRepository {
  checkAlarmRule(
    deviceId: string,
    value: string,
    activationTime: string,
  ): Promise<CheckAlarmEntity | null>;
}

export const CHECK_ALARM_RULE_REPOSITORY = 'CHECK_ALARM_RULE_REPOSITORY';
