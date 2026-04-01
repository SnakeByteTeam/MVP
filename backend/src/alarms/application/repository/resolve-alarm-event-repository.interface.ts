export interface ResolveAlarmEventRepository {
  resolveAlarmEvent(id: string): Promise<void>;
}

export const RESOLVE_ALARM_EVENT_REPOSITORY = 'RESOLVE_ALARM_EVENT_REPOSITORY';
