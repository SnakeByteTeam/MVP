import { AlarmEvent } from '../../../domain/models/alarm-event.model';

export interface GetAllAlarmEventsUseCase {
  getAllAlarmEvents(): Promise<AlarmEvent[]>;
}

export const GET_ALL_ALARM_EVENTS_USE_CASE = 'GET_ALL_ALARM_EVENTS_USE_CASE';
