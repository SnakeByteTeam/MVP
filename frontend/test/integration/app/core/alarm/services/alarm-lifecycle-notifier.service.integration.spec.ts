import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import {
    ALARM_LIFECYCLE_UPDATED_EVENT,
    AlarmLifecycleUpdateDetail,
} from 'src/app/core/alarm/models/realtime-alarm-event.model';
import { AlarmStateService } from 'src/app/core/alarm/services/alarm-state.service';
import { AlarmLifecycleNotifierService } from 'src/app/core/alarm/services/alarm-lifecycle-notifier.service';
import {
    DEFAULT_RESOLVED_NOTIFICATION_TITLE,
    DEFAULT_TRIGGERED_NOTIFICATION_TITLE,
} from 'src/app/core/notification/utils/notification-title.util';

describe('AlarmLifecycleNotifierService', () => {
    let service: AlarmLifecycleNotifierService;
    let alarmStateService: { onNotificationReceived: ReturnType<typeof vi.fn> };
    let dispatchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        alarmStateService = {
            onNotificationReceived: vi.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                AlarmLifecycleNotifierService,
                { provide: AlarmStateService, useValue: alarmStateService },
            ],
        });

        service = TestBed.inject(AlarmLifecycleNotifierService);
        dispatchSpy = vi.spyOn(globalThis, 'dispatchEvent').mockReturnValue(true);
    });

    afterEach(() => {
        dispatchSpy.mockRestore();
        vi.unstubAllGlobals();
    });

    it('pubblica notifica e evento lifecycle per un allarme triggered', () => {
        service.publish('triggered', 'alarm-1', '2026-04-13T08:00:00.000Z', {
            alarmName: ' Porta   ingresso  aperta ',
            priority: AlarmPriority.RED,
        });

        expect(alarmStateService.onNotificationReceived).toHaveBeenCalledWith({
            notificationId: 'alarm-triggered-alarm-1',
            title: '▲ Porta ingresso aperta',
            sentAt: '2026-04-13T08:00:00.000Z',
            eventType: 'triggered',
        });

        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        const dispatchedEvent = dispatchSpy.mock.calls[0][0] as CustomEvent<AlarmLifecycleUpdateDetail>;
        expect(dispatchedEvent).toBeInstanceOf(CustomEvent);
        expect(dispatchedEvent.type).toBe(ALARM_LIFECYCLE_UPDATED_EVENT);
        expect(dispatchedEvent.detail).toEqual({
            type: 'triggered',
            alarmEventId: 'alarm-1',
        });
    });

    it('usa il titolo resolved di default per un allarme resolved', () => {
        service.publish('resolved', 'alarm-2', '2026-04-13T09:00:00.000Z');

        expect(alarmStateService.onNotificationReceived).toHaveBeenCalledWith({
            notificationId: 'alarm-resolved-alarm-2',
            title: DEFAULT_RESOLVED_NOTIFICATION_TITLE,
            sentAt: '2026-04-13T09:00:00.000Z',
            eventType: 'resolved',
        });
    });

    it('ripiega sul titolo default quando i dettagli triggered non sono validi', () => {
        service.publish('triggered', 'alarm-3', '2026-04-13T10:00:00.000Z', {
            alarmName: '',
            priority: 'unknown',
        });

        expect(alarmStateService.onNotificationReceived).toHaveBeenCalledWith({
            notificationId: 'alarm-triggered-alarm-3',
            title: DEFAULT_TRIGGERED_NOTIFICATION_TITLE,
            sentAt: '2026-04-13T10:00:00.000Z',
            eventType: 'triggered',
        });
    });

    it('usa Event quando CustomEvent non e disponibile', () => {
        vi.stubGlobal('CustomEvent', undefined);

        service.publish('resolved', 'alarm-4', '2026-04-13T11:00:00.000Z');

        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        const dispatchedEvent = dispatchSpy.mock.calls[0][0] as Event;
        expect(dispatchedEvent).toBeInstanceOf(Event);
        expect(dispatchedEvent.type).toBe(ALARM_LIFECYCLE_UPDATED_EVENT);
    });
});
