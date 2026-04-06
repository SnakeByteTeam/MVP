import { CheckAlarm } from 'src/alarms/domain/models/check-alarm';
import { CheckAlarmRuleCmd } from '../../commands/check-alarm-rule-cmd';

export interface CheckAlarmRuleUseCase {
  checkAlarmRule(req: CheckAlarmRuleCmd): Promise<void>;
}

export const CHECK_ALARM_RULE_USECASE = Symbol('CheckAlarmRuleUseCase');
