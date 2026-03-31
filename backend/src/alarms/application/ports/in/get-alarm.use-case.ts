import { Alarm } from '../../../domain/models/alarm.model';
import { GetAlarmCmd } from '../../commands/get-alarm-cmd';

export interface GetAlarmUseCase {
  getAlarm(req: GetAlarmCmd): Promise<Alarm>;
}

export const GET_ALARM_USE_CASE = 'GET_ALARM_USE_CASE';
