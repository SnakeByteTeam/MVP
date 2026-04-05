export interface ResolveAlarmEventRepository {
  resolveAlarmEvent(alarmId: string, userId: number): Promise<void>;
}

export const RESOLVE_ALARM_EVENT_REPOSITORY = 'RESOLVE_ALARM_EVENT_REPOSITORY';
