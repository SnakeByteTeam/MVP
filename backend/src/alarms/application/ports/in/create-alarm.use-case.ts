import { Alarm } from '../../../domain/models/alarm.model';
import { CreateAlarmCmd } from '../../commands/create-alarm.cmd';

export const CREATE_ALARM_USE_CASE = 'CREATE_ALARM_USE_CASE';

export interface CreateAlarmUseCase {
  createAlarm(cmd: CreateAlarmCmd): Promise<Alarm>;
}
