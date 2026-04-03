import { CheckAlarm } from '../../../domain/models/check-alarm';
import { CheckAlarmRuleCmd } from '../../commands/check-alarm-rule-cmd';

export interface CheckAlarmRulePort {
  checkAlarmRule(req: CheckAlarmRuleCmd): Promise<CheckAlarm | null>;
}

export const CHECK_ALARM_RULE_PORT = 'CHECK_ALARM_RULE_PORT';
