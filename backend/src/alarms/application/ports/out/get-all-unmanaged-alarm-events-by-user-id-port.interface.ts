import { AlarmEvent } from '../../../domain/models/alarm-event.model';
import { GetAllUnmanagedAlarmEventsByUserIdCmd } from '../../commands/get-all-unmanaged-alarm-events-by-user-id-cmd';

export interface GetAllUnmanagedAlarmEventsByUserIdPort {
  getAllUnmanagedAlarmEventsByUserId(
    req: GetAllUnmanagedAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]>;
}

export const GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_PORT =
  'GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_PORT';
