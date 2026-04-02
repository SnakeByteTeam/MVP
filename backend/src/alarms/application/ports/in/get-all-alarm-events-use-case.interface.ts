import { AlarmEvent } from '../../../domain/models/alarm-event.model';
import { GetAllAlarmEventsCmd } from '../../commands/get-all-alarm-events-cmd';

export interface GetAllAlarmEventsUseCase {
  getAllAlarmEvents(req: GetAllAlarmEventsCmd): Promise<AlarmEvent[]>;
}

export const GET_ALL_ALARM_EVENTS_USE_CASE = 'GET_ALL_ALARM_EVENTS_USE_CASE';
