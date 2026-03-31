import { AlarmRule } from '../../../domain/models/alarm-rule.model';
import { CreateAlarmRuleCmd } from '../../commands/create-alarm-rule.cmd';

export interface CreateAlarmRuleUseCase {
  createAlarmRule(cmd: CreateAlarmRuleCmd): Promise<AlarmRule>;
}

export const CREATE_ALARM_RULE_USE_CASE = 'CREATE_ALARM_RULE_USE_CASE';
