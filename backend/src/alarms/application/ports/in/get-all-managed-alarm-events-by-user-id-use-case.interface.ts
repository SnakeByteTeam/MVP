import { AlarmEvent } from '../../../domain/models/alarm-event.model';
import { GetAllManagedAlarmEventsByUserIdCmd } from '../../commands/get-all-managed-alarm-events-by-user-id-cmd';

export interface GetAllManagedAlarmEventsByUserIdUseCase {
  getAllManagedAlarmEventsByUserId(
    req: GetAllManagedAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]>;
}

export const GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE =
  'GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE';
