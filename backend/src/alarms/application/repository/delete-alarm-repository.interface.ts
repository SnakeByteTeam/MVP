export interface DeleteAlarmRepository {
  deleteAlarmRule(id: string): Promise<void>;
}

export const DELETE_ALARM_REPOSITORY = 'DELETE_ALARM_REPOSITORY';
