import { NotifyAlarmResolutionCmd } from '../../commands/notify-alarm-resolution.command';

export interface NotifyAlarmResolutionPort {
  notifyAlarmResolution(cmd: NotifyAlarmResolutionCmd): Promise<void>;
}

export const NOTIFY_ALARM_RESOLUTION_PORT = Symbol('NotifyAlarmResolutionPort');
