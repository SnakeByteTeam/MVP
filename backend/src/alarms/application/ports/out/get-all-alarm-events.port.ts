import { AlarmEvent } from '../../../domain/models/alarm-event.model';

export interface GetAllAlarmEventsPort {
  getAllAlarmEvents(): Promise<AlarmEvent[]>;
}

export const GET_ALL_ALARM_EVENTS_PORT = 'GET_ALL_ALARM_EVENTS_PORT';
