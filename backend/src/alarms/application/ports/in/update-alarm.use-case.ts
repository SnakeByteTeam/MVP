import { Alarm } from '../../../domain/models/alarm.model';
import { UpdateAlarmCmd } from '../../commands/update-alarm.cmd';

export const UPDATE_ALARM_USE_CASE = 'UPDATE_ALARM_USE_CASE';

export interface UpdateAlarmUseCase {
  updateAlarm(cmd: UpdateAlarmCmd): Promise<Alarm>;
}
