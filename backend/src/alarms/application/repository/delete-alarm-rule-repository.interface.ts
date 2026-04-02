export interface DeleteAlarmRuleRepository {
  deleteAlarmRule(id: string): Promise<void>;
}

export const DELETE_ALARM_RULE_REPOSITORY = 'DELETE_ALARM_RULE_REPOSITORY';
