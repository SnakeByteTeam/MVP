import { AlarmEvent } from '../../../domain/models/alarm-event.model';
import { GetAllAlarmEventsCmd } from '../../commands/get-all-alarm-events-cmd';

export interface GetAllAlarmEventsPort {
  getAllAlarmEvents(req: GetAllAlarmEventsCmd): Promise<AlarmEvent[]>;
}

export const GET_ALL_ALARM_EVENTS_PORT = 'GET_ALL_ALARM_EVENTS_PORT';
