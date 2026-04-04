import { ActiveAlarm } from '../../../domain/models/alarm-event.model';

export interface GetAllActiveAlarmsPort {
  getAllActiveAlarms(): Promise<ActiveAlarm[]>;
}

export const GET_ALL_ACTIVE_ALARMS_PORT = 'GET_ALL_ACTIVE_ALARMS_PORT';
