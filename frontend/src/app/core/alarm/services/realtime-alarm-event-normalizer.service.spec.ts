import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AlarmPriority } from '../models/alarm-priority.enum';
import { PushEventType } from '../models/push-event-type.enum';
import { RealtimeAlarmEventNormalizerService } from './realtime-alarm-event-normalizer.service';

describe('RealtimeAlarmEventNormalizerService', () => {
	let service: RealtimeAlarmEventNormalizerService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [RealtimeAlarmEventNormalizerService],
		});

		service = TestBed.inject(RealtimeAlarmEventNormalizerService);
	});

	it('tryParseEnvelope valida il formato legacy con eventType/payload/timestamp', () => {
		const parsed = service.tryParseEnvelope({
			eventType: PushEventType.ALARM_TRIGGERED,
			payload: { id: 'a1' },
			timestamp: '2026-04-07T11:00:00.000Z',
		});

		expect(parsed).toEqual({
			eventType: PushEventType.ALARM_TRIGGERED,
			payload: { id: 'a1' },
			timestamp: '2026-04-07T11:00:00.000Z',
		});
	});

	it('parseAlarmEvent produce AlarmEvent solo con payload completo', () => {
		const parsed = service.parseAlarmEvent({
			id: 'alarm-1',
			alarmRuleId: 'rule-1',
			alarmName: 'Allarme test',
			priority: AlarmPriority.RED,
			activationTime: '2026-04-07T11:00:00.000Z',
			resolutionTime: null,
		});

		expect(parsed?.id).toBe('alarm-1');
		expect(parsed?.priority).toBe(AlarmPriority.RED);
	});

	it('parseBackendTriggeredPayload accetta il contratto backend nativo', () => {
		const parsed = service.parseBackendTriggeredPayload({
			alarmEventId: 'alarm-2',
			wardId: 3,
			alarmRuleId: 'rule-2',
		});

		expect(parsed).toEqual({
			alarmEventId: 'alarm-2',
			wardId: 3,
			alarmRuleId: 'rule-2',
		});
	});

	it('extractAlarmId supporta sia id che alarmEventId', () => {
		expect(service.extractAlarmId({ id: 'a-id' })).toBe('a-id');
		expect(service.extractAlarmId({ alarmEventId: 'a-event-id' })).toBe('a-event-id');
	});
});
