export interface NotifyAlarmWardRepoPort {
    notifyAlarmWard(wardId: string, alarm: AlarmEventDto): Promise<void>
}

export const NOTIFY_ALARM_WARD_REPO_PORT = Symbol('NotifyAlarmWardRepoPort');