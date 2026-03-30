import { Alarm } from '../../../domain/models/alarm.model';

export const GET_ALL_ALARMS_PORT = 'GET_ALL_ALARMS_PORT';

export interface GetAllAlarmsPort {
  getAllAlarms(): Promise<Alarm[]>;
}
