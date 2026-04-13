import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ActiveAlarm } from 'src/app/core/alarm/models/active-alarm.model';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import { AlarmManagementTablePresenterService } from 'src/app/features/alarm-management/services/alarm-management-table-presenter.service';

describe('AlarmManagementTablePresenterService', () => {
    let service: AlarmManagementTablePresenterService;

    const baseAlarm: ActiveAlarm = {
        id: 'active-1',
        alarmRuleId: 'rule-1',
        deviceId: 'device-1',
        alarmName: 'Allarme antipanico',
        priority: AlarmPriority.RED,
        activationTime: '2026-03-24T10:00:00.000Z',
        resolutionTime: null,
        position: '  Camera 101  ',
        userId: 9,
        userUsername: 'operator-9',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AlarmManagementTablePresenterService],
        });

        service = TestBed.inject(AlarmManagementTablePresenterService);
    });

    it('mappa un allarme aperto con azione gestibile', () => {
        const row = service.toRows([baseAlarm], null)[0];

        expect(row.id).toBe('active-1');
        expect(row.status).toBe('Da gestire');
        expect(row.isManaged).toBe(false);
        expect(row.isResolving).toBe(false);
        expect(row.isActionDisabled).toBe(false);
        expect(row.actionLabel).toBe('GESTISCI');
        expect(row.actionAriaLabel).toBe('Gestisci allarme Allarme antipanico');
        expect(row.location).toBe('Camera 101');
        expect(row.device).toBe('device-1');
        expect(row.openedAt).toBe('2026-03-24T10:00:00.000Z');
    });

    it('mappa un allarme gia gestito come non azionabile', () => {
        const managedAlarm: ActiveAlarm = {
            ...baseAlarm,
            resolutionTime: '2026-03-24T10:05:00.000Z',
            userId: 77,
            userUsername: 'operator-77',
        };

        const row = service.toRows([managedAlarm], null)[0];

        expect(row.status).toBe('Non da gestire');
        expect(row.isManaged).toBe(true);
        expect(row.isActionDisabled).toBe(true);
        expect(row.actionLabel).toBe('GESTITO');
        expect(row.actionAriaLabel).toBe('Allarme gia gestito Allarme antipanico');
        expect(row.openedAt).toBe('2026-03-24T10:00:00.000Z');
    });

    it('quando l allarme e in risoluzione mostra stato e label specifici', () => {
        const row = service.toRows([baseAlarm], 'active-1')[0];

        expect(row.isResolving).toBe(true);
        expect(row.isActionDisabled).toBe(true);
        expect(row.actionLabel).toBe('GESTIONE...');
        expect(row.status).toBe('Da gestire');
    });

    it('applica fallback su posizione, manager e orari invalidi', () => {
        const invalidAlarm: ActiveAlarm = {
            ...baseAlarm,
            activationTime: 'abcde12345',
            resolutionTime: 'not-a-date',
            position: '   ',
            userId: null,
            userUsername: null,
            deviceId: undefined,
        };

        const row = service.toRows([invalidAlarm], null)[0];

        expect(row.location).toBe('-');
        expect(row.device).toBe('-');
        expect(row.openedAt).toBe('abcde12345');
    });

    it('normalizza nome allarme vuoto per testo riga e aria label', () => {
        const unnamedAlarm: ActiveAlarm = {
            ...baseAlarm,
            alarmName: '   ',
        };

        const row = service.toRows([unnamedAlarm], null)[0];

        expect(row.name).toBe('senza nome');
        expect(row.actionAriaLabel).toBe('Gestisci allarme senza nome');
    });

    it('gestisce posizione null senza eccezioni runtime', () => {
        const invalidAlarm = {
            ...baseAlarm,
            position: null,
        } as unknown as ActiveAlarm;

        const row = service.toRows([invalidAlarm], null)[0];

        expect(row.location).toBe('-');
    });
});
