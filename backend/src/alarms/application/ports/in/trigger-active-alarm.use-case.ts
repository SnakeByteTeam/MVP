import { TriggerActiveAlarmCmd } from '../../commands/trigger-active-alarm.cmd';

export const TRIGGER_ACTIVE_ALARM_USE_CASE = 'TRIGGER_ACTIVE_ALARM_USE_CASE';

export interface TriggerActiveAlarmUseCase {
  triggerActiveAlarm(cmd: TriggerActiveAlarmCmd): Promise<void>;
}
