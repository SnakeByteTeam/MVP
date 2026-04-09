import { NotifyAlarmResolutionCmd } from '../../commands/notify-alarm-resolution.command';

export interface NotifyAlarmResolutionUseCase {
  notifyAlarmResolution(cmd: NotifyAlarmResolutionCmd): Promise<void>;
}

export const NOTIFY_ALARM_RESOLUTION_USECASE = Symbol(
  'NotifyAlarmResolutionUseCase',
);
