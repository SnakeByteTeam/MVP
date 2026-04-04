import { ResolveAlarmEventCmd } from '../../commands/resolve-alarm-event-cmd';

export interface ResolveAlarmEventPort {
  resolveAlarmEvent(req: ResolveAlarmEventCmd): Promise<void>;
}

export const RESOLVE_ALARM_EVENT_PORT = 'RESOLVE_ALARM_EVENT_PORT';
