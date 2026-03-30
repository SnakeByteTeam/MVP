export const RESOLVE_ACTIVE_ALARM_USE_CASE = 'RESOLVE_ACTIVE_ALARM_USE_CASE';

export interface ResolveActiveAlarmUseCase {
  resolveActiveAlarm(id: string): Promise<void>;
}
