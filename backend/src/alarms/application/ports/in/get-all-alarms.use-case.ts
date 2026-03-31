import { Alarm } from '../../../domain/models/alarm.model';

export interface GetAllAlarmsUseCase {
  getAllAlarms(): Promise<Alarm[]>;
}

export const GET_ALL_ALARMS_USE_CASE = 'GET_ALL_ALARMS_USE_CASE';
