import { Alarm } from '../../../domain/models/alarm.model';
import { CreateAlarmCmd } from '../../commands/create-alarm.cmd';

export const CREATE_ALARM_PORT = 'CREATE_ALARM_PORT';

export interface CreateAlarmPort {
  createAlarm(cmd: CreateAlarmCmd): Promise<Alarm>;
}
