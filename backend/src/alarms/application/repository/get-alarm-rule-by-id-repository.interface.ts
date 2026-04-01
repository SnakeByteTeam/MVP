import { AlarmRuleEntity } from '../../infrastructure/entities/alarm-rule-entity';

export interface GetAlarmRuleByIdRepository {
  getAlarmRuleById(id: string): Promise<AlarmRuleEntity | null>;
}

export const GET_ALARM_RULE_BY_ID_REPOSITORY =
  'GET_ALARM_RULE_BY_ID_REPOSITORY';
