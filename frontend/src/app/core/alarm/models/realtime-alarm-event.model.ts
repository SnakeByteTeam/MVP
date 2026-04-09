export type AlarmLifecycleType = 'triggered' | 'resolved';

export interface BackendTriggeredPayload {
	alarmEventId: string;
	wardId: number;
	alarmRuleId: string;
}

export interface BackendResolvedPayload {
	alarmEventId: string;
	wardId?: number;
}

export interface AlarmLifecycleUpdateDetail {
	type: AlarmLifecycleType;
	alarmEventId: string;
}

export const ALARM_LIFECYCLE_UPDATED_EVENT = 'alarm-lifecycle-updated';
