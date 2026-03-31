import { Alarm } from '../../../domain/models/alarm.model';
import { CreateAlarmCmd } from '../../commands/create-alarm.cmd';

export interface CreateAlarmUseCase {
  createAlarm(cmd: CreateAlarmCmd): Promise<Alarm>;
}

export const CREATE_ALARM_USE_CASE = 'CREATE_ALARM_USE_CASE';
