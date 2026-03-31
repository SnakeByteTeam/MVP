import { ActiveAlarmEntity } from '../../infrastructure/entities/active-alarm-entity';

export interface GetAllActiveAlarmsRepository {
  getAllActiveAlarms(): Promise<ActiveAlarmEntity[]>;
}

export const GET_ALL_ACTIVE_ALARMS_REPOSITORY =
  'GET_ALL_ACTIVE_ALARMS_REPOSITORY';
