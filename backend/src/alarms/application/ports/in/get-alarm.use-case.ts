import { Alarm } from '../../../domain/models/alarm.model';

export const GET_ALARM_USE_CASE = 'GET_ALARM_USE_CASE';

export interface GetAlarmUseCase {
  getAlarm(id: string): Promise<Alarm>;
}
