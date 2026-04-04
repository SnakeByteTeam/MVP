export interface ResolveActiveAlarmRepository {
  resolveActiveAlarm(id: string): Promise<void>;
}

export const RESOLVE_ACTIVE_ALARM_REPOSITORY =
  'RESOLVE_ACTIVE_ALARM_REPOSITORY';
