import { AlarmEventEntity } from '../../infrastructure/entities/alarm-event-entity';

export interface GetAllManagedAlarmEventsByUserIdRepository {
  getAllManagedAlarmEventsByUserId(
    id: number,
    limit: number,
    offset: number,
  ): Promise<AlarmEventEntity[]>;
}

export const GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_REPOSITORY =
  'GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_REPOSITORY';
