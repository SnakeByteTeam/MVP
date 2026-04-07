export interface NotifyAlarmResolutionRepoPort {
    notifyAlarmResolution(alarmId: string, wardId: number): Promise<void>;
}

export const NOTIFY_ALARM_RESOLUTION_REPO_PORT = Symbol('NotifyAlarmResolutionRepoPort');