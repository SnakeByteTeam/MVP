import { ResolveActiveAlarmCmd } from '../../commands/resolve-active-alarm-cmd';

export interface ResolveActiveAlarmUseCase {
  resolveActiveAlarm(req: ResolveActiveAlarmCmd): Promise<void>;
}

export const RESOLVE_ACTIVE_ALARM_USE_CASE = 'RESOLVE_ACTIVE_ALARM_USE_CASE';
