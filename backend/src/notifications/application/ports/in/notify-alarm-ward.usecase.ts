import { NotifyAlarmWardCmd } from '../../commands/notify-alarm-ward.command';

export interface NotifyAlarmWardUseCase {
  notifyAlarmWard(cmd: NotifyAlarmWardCmd): Promise<void>;
}

export const NOTIFY_ALARM_WARD_USECASE = Symbol('NotifyAlarmWardUseCase');
