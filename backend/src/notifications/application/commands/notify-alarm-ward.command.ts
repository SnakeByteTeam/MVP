import { CheckAlarm } from 'src/alarms/domain/models/check-alarm';

export interface NotifyAlarmWardCmd {
  alarm: CheckAlarm;
}
