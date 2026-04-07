export interface GetWardAlarmEventRepoPort {
    getWardAlarmEvent(alarmId: string): Promise<number>;
}

export const GET_WARD_ALARM_EVENT_REPO_PORT = Symbol('GetWardAlarmEventRepoPort');