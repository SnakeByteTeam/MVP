export const DELETE_ALARM_PORT = 'DELETE_ALARM_PORT';

export interface DeleteAlarmPort {
  deleteAlarm(id: string): Promise<void>;
}
