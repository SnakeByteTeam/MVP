import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmStateService } from './alarm-state.service';
import { AlarmLifecycleNotifierService } from './alarm-lifecycle-notifier.service';

describe('AlarmLifecycleNotifierService', () => {
	let service: AlarmLifecycleNotifierService;

	const alarmStateSpy = {
		onNotificationReceived: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();

		TestBed.configureTestingModule({
			providers: [
				AlarmLifecycleNotifierService,
				{ provide: AlarmStateService, useValue: alarmStateSpy },
			],
		});

		service = TestBed.inject(AlarmLifecycleNotifierService);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('publish emette NotificationEvent coerente per allarme triggerato', () => {
		const dispatchSpy = vi.spyOn(globalThis, 'dispatchEvent');
		service.publish('triggered', 'alarm-1', '2026-04-07T11:10:00.000Z', {
			alarmName: 'Sensore di movimento in corridoio ovest',
			priority: 4,
		});

		expect(alarmStateSpy.onNotificationReceived).toHaveBeenCalledWith({
			notificationId: 'alarm-triggered-alarm-1',
			title: '▲ Sensore di movimento in corridoio ovest',
			sentAt: '2026-04-07T11:10:00.000Z',
			eventType: 'triggered',
		});
		expect(dispatchSpy).toHaveBeenCalled();
	});

	it('publish emette NotificationEvent coerente per allarme risolto', () => {
		service.publish('resolved', 'alarm-2', '2026-04-07T11:11:00.000Z');

		expect(alarmStateSpy.onNotificationReceived).toHaveBeenCalledWith({
			notificationId: 'alarm-resolved-alarm-2',
			title: 'Allarme risolto',
			sentAt: '2026-04-07T11:11:00.000Z',
			eventType: 'resolved',
		});
	});
});
