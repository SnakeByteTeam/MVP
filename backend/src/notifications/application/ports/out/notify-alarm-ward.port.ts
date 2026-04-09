import { NotifyAlarmWardCmd } from '../../commands/notify-alarm-ward.command';

export interface NotifyAlarmWardPort {
  notifyAlarmWard(cmd: NotifyAlarmWardCmd): Promise<void>;
}

export const NOTIFY_ALARM_WARD_PORT = Symbol('NotifyAlarmWardPort');
