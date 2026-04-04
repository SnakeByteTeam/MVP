import { ResolveActiveAlarmCmd } from '../../commands/resolve-active-alarm-cmd';

export interface ResolveActiveAlarmPort {
  resolveActiveAlarm(req: ResolveActiveAlarmCmd): Promise<void>;
}

export const RESOLVE_ACTIVE_ALARM_PORT = 'RESOLVE_ACTIVE_ALARM_PORT';
