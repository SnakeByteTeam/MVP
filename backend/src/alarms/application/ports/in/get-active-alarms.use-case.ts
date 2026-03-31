import { ActiveAlarm } from '../../../domain/models/active-alarm.model';

export interface GetActiveAlarmsUseCase {
  getActiveAlarms(): Promise<ActiveAlarm[]>;
}

export const GET_ACTIVE_ALARMS_USE_CASE = 'GET_ACTIVE_ALARMS_USE_CASE';
