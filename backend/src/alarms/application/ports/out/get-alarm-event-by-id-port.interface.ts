import { AlarmEvent } from '../../../domain/models/alarm-event.model';
import { GetAlarmEventByIdCmd } from '../../commands/get-alarm-event-by-id-cmd';

export interface GetAlarmEventByIdPort {
  getAlarmEventById(req: GetAlarmEventByIdCmd): Promise<AlarmEvent | null>;
}

export const GET_ALARM_EVENT_BY_ID_PORT = 'GET_ALARM_EVENT_BY_ID_PORT';
