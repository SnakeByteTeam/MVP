import { AlarmEvent } from '../../../domain/models/alarm-event.model';
import { GetAllAlarmEventsByUserIdCmd } from '../../commands/get-all-alarm-events-by-user-id-cmd';

export interface GetAllAlarmEventsByUserIdPort {
  getAllAlarmEventsByUserId(
    req: GetAllAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]>;
}

export const GET_ALL_ALARM_EVENTS_BY_USER_ID_PORT =
  'GET_ALL_ALARM_EVENTS_BY_USER_ID_PORT';
