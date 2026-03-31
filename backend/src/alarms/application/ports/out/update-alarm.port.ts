import { Alarm } from '../../../domain/models/alarm-rule.model';
import { UpdateAlarmCmd } from '../../commands/update-alarm-rule.cmd';

export interface UpdateAlarmPort {
  updateAlarm(cmd: UpdateAlarmCmd): Promise<Alarm>;
}

export const UPDATE_ALARM_PORT = 'UPDATE_ALARM_PORT';
