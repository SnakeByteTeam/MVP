export const DELETE_ALARM_USE_CASE = 'DELETE_ALARM_USE_CASE';

export interface DeleteAlarmUseCase {
  deleteAlarm(id: string): Promise<void>;
}
