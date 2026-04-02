import { AlarmEventEntity } from '../../infrastructure/entities/alarm-event-entity';

export interface GetAllAlarmEventsRepository {
  getAllAlarmEvents(): Promise<AlarmEventEntity[]>;
}

export const GET_ALL_ALARM_EVENTS_REPOSITORY =
  'GET_ALL_ALARM_EVENTS_REPOSITORY';
