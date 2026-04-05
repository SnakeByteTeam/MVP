import { AlarmEvent } from '../../../domain/models/alarm-event.model';
import { GetAllManagedAlarmEventsByUserIdCmd } from '../../commands/get-all-managed-alarm-events-by-user-id-cmd';

export interface GetAllManagedAlarmEventsByUserIdPort {
  getAllManagedAlarmEventsByUserId(
    req: GetAllManagedAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]>;
}

export const GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_PORT =
  'GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_PORT';
