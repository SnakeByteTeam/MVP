import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RealtimeAlarmEventNormalizerService } from './realtime-alarm-event-normalizer.service';

describe('RealtimeAlarmEventNormalizerService', () => {
	let service: RealtimeAlarmEventNormalizerService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [RealtimeAlarmEventNormalizerService],
		});

		service = TestBed.inject(RealtimeAlarmEventNormalizerService);
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

	it('parseBackendTriggeredPayload accetta wardId numerico espresso come stringa', () => {
		const parsed = service.parseBackendTriggeredPayload({
			alarmEventId: 'alarm-3',
			wardId: '12',
			alarmRuleId: 'rule-3',
		});

		expect(parsed).toEqual({
			alarmEventId: 'alarm-3',
			wardId: 12,
			alarmRuleId: 'rule-3',
		});
	});

	it('parseBackendResolvedPayload estrae alarmEventId e wardId opzionale', () => {
		const withWardId = service.parseBackendResolvedPayload({
			alarmEventId: 'alarm-4',
			wardId: 8,
		});

		const withoutWardId = service.parseBackendResolvedPayload({
			alarmEventId: 'alarm-5',
		});

		expect(withWardId).toEqual({ alarmEventId: 'alarm-4', wardId: 8 });
		expect(withoutWardId).toEqual({ alarmEventId: 'alarm-5', wardId: undefined });
	});

	it('restituisce null per payload backend malformati', () => {
		expect(
			service.parseBackendTriggeredPayload({
				alarmEventId: 'alarm-6',
				wardId: 'abc',
				alarmRuleId: 'rule-6',
			})
		).toBeNull();

		expect(
			service.parseBackendResolvedPayload({
				alarmEventId: 999,
				wardId: 8,
			})
		).toBeNull();
	});
});
