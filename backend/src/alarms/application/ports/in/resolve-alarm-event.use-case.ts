import { ResolveAlarmEventCmd } from '../../commands/resolve-alarm-event-cmd';

export interface ResolveAlarmEventUseCase {
  resolveAlarmEvent(req: ResolveAlarmEventCmd): Promise<void>;
}

export const RESOLVE_ALARM_EVENT_USE_CASE = 'RESOLVE_ALARM_EVENT_USE_CASE';
