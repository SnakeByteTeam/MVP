import { Injectable, InjectionToken, inject } from '@angular/core';
import { BackendResolvedPayload, BackendTriggeredPayload } from '../models/realtime-alarm-event.model';

export interface RealtimeAlarmEventNormalizerPort {
	parseBackendTriggeredPayload(payload: unknown): BackendTriggeredPayload | null;
	parseBackendResolvedPayload(payload: unknown): BackendResolvedPayload | null;
}

export const REALTIME_ALARM_EVENT_NORMALIZER = new InjectionToken<RealtimeAlarmEventNormalizerPort>(
	'REALTIME_ALARM_EVENT_NORMALIZER',
	{
		providedIn: 'root',
		factory: () => inject(RealtimeAlarmEventNormalizerService),
	}
);

@Injectable({ providedIn: 'root' })
export class RealtimeAlarmEventNormalizerService implements RealtimeAlarmEventNormalizerPort {
	public parseBackendTriggeredPayload(payload: unknown): BackendTriggeredPayload | null {
		if (!this.isObject(payload)) {
			return null;
		}

		const alarmEventId = payload['alarmEventId'];
		const wardId = payload['wardId'];
		const alarmRuleId = payload['alarmRuleId'];
		const normalizedWardId = this.parseWardId(wardId);

		if (
			typeof alarmEventId !== 'string' ||
			normalizedWardId === null ||
			typeof alarmRuleId !== 'string'
		) {
			return null;
		}

		return {
			alarmEventId,
			wardId: normalizedWardId,
			alarmRuleId,
		};
	}

	public parseBackendResolvedPayload(payload: unknown): BackendResolvedPayload | null {
		if (!this.isObject(payload)) {
			return null;
		}

		const alarmEventId = payload['alarmEventId'];
		const wardId = payload['wardId'];
		const normalizedWardId = this.parseWardId(wardId);

		if (typeof alarmEventId !== 'string') {
			return null;
		}

		return {
			alarmEventId,
			wardId: normalizedWardId ?? undefined,
		};
	}

	private isObject(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null;
	}

	private parseWardId(value: unknown): number | null {
		if (typeof value === 'number' && Number.isInteger(value)) {
			return value;
		}

		if (typeof value !== 'string') {
			return null;
		}

		const trimmed = value.trim();
		if (!trimmed) {
			return null;
		}

		const parsed = Number(trimmed);
		return Number.isInteger(parsed) ? parsed : null;
	}
}
