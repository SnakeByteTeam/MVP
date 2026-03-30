import { Alarm } from '../../../domain/models/alarm.model';

export const GET_ALL_ALARMS_BY_REQUEST_PORT = 'GET_ALL_ALARMS_BY_REQUEST_PORT';

export interface GetAllAlarmsByRequestPort {
  getAllAlarmsByRequest(plantId?: string, deviceId?: string): Promise<Alarm[]>;
}
