import { Alarm } from '../../../domain/models/alarm.model';

export const GET_ALARM_BY_ID_PORT = 'GET_ALARM_BY_ID_PORT';

export interface GetAlarmByIdPort {
  getAlarmById(id: string): Promise<Alarm | null>;
}
