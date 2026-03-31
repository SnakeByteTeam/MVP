import { DeleteAlarmCmd } from '../../commands/delete-alarm-cmd';

export interface DeleteAlarmUseCase {
  deleteAlarm(req: DeleteAlarmCmd): Promise<void>;
}

export const DELETE_ALARM_USE_CASE = 'DELETE_ALARM_USE_CASE';
