export interface CreateAlarmEventRepository {
  createAlarmEvent(alarmRuleId: string, activationTime: Date): Promise<string>;
}

export const CREATE_ALARM_EVENT_REPOSITORY = 'CREATE_ALARM_EVENT_REPOSITORY';
