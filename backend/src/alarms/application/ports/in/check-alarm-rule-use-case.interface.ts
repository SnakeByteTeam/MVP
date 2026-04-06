import { CheckAlarmRuleCmd } from '../../commands/check-alarm-rule-cmd';

export interface CheckAlarmRuleUseCase {
  checkAlarmRule(req: CheckAlarmRuleCmd): Promise<number | void>;
}
