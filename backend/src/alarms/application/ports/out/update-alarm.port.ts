import { Alarm } from '../../../domain/models/alarm.model';
import { UpdateAlarmCmd } from '../../commands/update-alarm.cmd';

export const UPDATE_ALARM_PORT = 'UPDATE_ALARM_PORT';

export interface UpdateAlarmPort {
  updateAlarm(id: string, cmd: UpdateAlarmCmd): Promise<Alarm>;
}
