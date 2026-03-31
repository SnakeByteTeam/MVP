import { Alarm } from '../../../domain/models/alarm-rule.model';

export interface GetAllAlarmsByRequestPort {
  getAllAlarmsByRequest(plantId?: string, deviceId?: string): Promise<Alarm[]>;
}

export const GET_ALL_ALARMS_BY_REQUEST_PORT = 'GET_ALL_ALARMS_BY_REQUEST_PORT';
