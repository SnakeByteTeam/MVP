import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import type { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import type { AlarmConfigFormValue } from '../models/alarm-config-form-value.model';
import { AlarmConfigStateService } from './alarm-config-state.service';

describe('AlarmConfigStateService', () => {
    let service: AlarmConfigStateService;

    const apiStub = {
        getAlarms: vi.fn(),
        getAlarm: vi.fn(),
        createAlarm: vi.fn(),
        updateAlarm: vi.fn(),
        deleteAlarm: vi.fn(),
    };

    const alarmA: AlarmRule = {
        id: 'alarm-1',
        name: 'Temperatura stanza',
        apartmentId: 'apt-1',
        deviceId: 'dev-1',
        priority: AlarmPriority.RED,
        thresholdOperator: ThresholdOperator.GREATER_THAN,
        threshold: 30,
        activationTime: '08:00',
        deactivationTime: '20:00',
        enabled: true,
    };

    const alarmB: AlarmRule = {
        id: 'alarm-2',
        name: 'Umidita critica',
        apartmentId: 'apt-2',
        deviceId: 'dev-2',
        priority: AlarmPriority.ORANGE,
        thresholdOperator: ThresholdOperator.LESS_THAN,
        threshold: 10,
        activationTime: '00:00',
        deactivationTime: '23:59',
        enabled: false,
    };

    const validForm: AlarmConfigFormValue = {
        name: '  Nuovo allarme  ',
        apartmentId: 'apt-1',
        sensorId: 'dev-3',
        priority: AlarmPriority.GREEN,
        thresholdOperator: ThresholdOperator.EQUAL_TO,
        threshold: 22,
        activationTime: '09:00',
        deactivationTime: '18:00',
        enabled: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        TestBed.configureTestingModule({
            providers: [
                AlarmConfigStateService,
                { provide: AlarmApiService, useValue: apiStub },
            ],
        });

        service = TestBed.inject(AlarmConfigStateService);
    });

    it('inizializza stato con alarms vuoti e nessun errore', async () => {
        expect(await firstValueFrom(service.alarms$)).toEqual([]);
        expect(await firstValueFrom(service.error$)).toBeNull();
    });

    it('loadAlarms aggiorna stato locale quando API risponde con successo', async () => {
        apiStub.getAlarms.mockReturnValue(of([alarmA, alarmB]));

        service.loadAlarms();

        const alarms = await firstValueFrom(service.alarms$);
        expect(apiStub.getAlarms).toHaveBeenCalledTimes(1);
        expect(alarms).toEqual([alarmA, alarmB]);
        expect(alarms).toHaveLength(2);
        expect(await firstValueFrom(service.error$)).toBeNull();
    });

    it('loadAlarms espone messaggio errore e pulisce error precedente al retry', async () => {
        apiStub.getAlarms.mockReturnValueOnce(throwError(() => new Error('network')));

        service.loadAlarms();
        expect(await firstValueFrom(service.error$)).toBe('Errore durante il caricamento degli allarmi.');

        apiStub.getAlarms.mockReturnValueOnce(of([alarmA]));
        service.loadAlarms();

        expect(await firstValueFrom(service.error$)).toBeNull();
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA]);
    });

    it('getAlarmById inoltra il valore di API in caso di successo', () => {
        apiStub.getAlarm.mockReturnValue(of(alarmA));

        let result: AlarmRule | null = null;
        service.getAlarmById('alarm-1').subscribe((alarm) => {
            result = alarm;
        });

        expect(apiStub.getAlarm).toHaveBeenCalledWith('alarm-1');
        expect(result).toEqual(alarmA);
    });

    it('getAlarmById in errore imposta messaggio e completa senza emissioni', async () => {
        apiStub.getAlarm.mockReturnValue(throwError(() => new Error('404')));

        let emitted = false;
        service.getAlarmById('missing').subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(await firstValueFrom(service.error$)).toBe('Errore durante il recupero dell\'allarme.');
    });

    it('createAlarm mappa il payload, chiama API e aggiunge il nuovo allarme allo stato', async () => {
        apiStub.getAlarms.mockReturnValue(of([alarmA]));
        service.loadAlarms();

        apiStub.createAlarm.mockReturnValue(of(alarmB));

        let created: AlarmRule | null = null;
        service.createAlarm(validForm).subscribe((alarm) => {
            created = alarm;
        });

        expect(apiStub.createAlarm).toHaveBeenCalledWith({
            name: 'Nuovo allarme',
            apartmentId: 'apt-1',
            deviceId: 'dev-3',
            priority: AlarmPriority.GREEN,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            threshold: '22',
            activationTime: '09:00',
            deactivationTime: '18:00',
        });
        expect(created).toEqual(alarmB);
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA, alarmB]);
    });

    it('createAlarm con form invalido non chiama API e imposta errore di validazione', async () => {
        const invalidForm: AlarmConfigFormValue = {
            ...validForm,
            name: '   ',
        };

        let emitted = false;
        service.createAlarm(invalidForm).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(apiStub.createAlarm).not.toHaveBeenCalled();
        expect(await firstValueFrom(service.error$)).toBe(
            'Dati del form non validi per la creazione dell\'allarme.'
        );
    });

    it('createAlarm in errore API imposta messaggio e non altera lo stato locale', async () => {
        apiStub.getAlarms.mockReturnValue(of([alarmA]));
        service.loadAlarms();

        apiStub.createAlarm.mockReturnValue(throwError(() => new Error('create failed')));

        let emitted = false;
        service.createAlarm(validForm).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(await firstValueFrom(service.error$)).toBe('Errore durante la creazione dell\'allarme.');
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA]);
    });

    it('updateAlarm mappa payload update e sostituisce l allarme nello stato', async () => {
        apiStub.getAlarms.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarms();

        const updatedAlarm: AlarmRule = { ...alarmA, name: 'Temperatura reparto', threshold: 35 };
        apiStub.updateAlarm.mockReturnValue(of(updatedAlarm));

        service.updateAlarm('alarm-1', validForm).subscribe();

        expect(apiStub.updateAlarm).toHaveBeenCalledWith('alarm-1', {
            name: 'Nuovo allarme',
            priority: AlarmPriority.GREEN,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            threshold: '22',
            activationTime: '09:00',
            deactivationTime: '18:00',
            enabled: true,
        });

        expect(await firstValueFrom(service.alarms$)).toEqual([updatedAlarm, alarmB]);
    });

    it('updateAlarm con form invalido non chiama API e imposta errore', async () => {
        const invalidForm: AlarmConfigFormValue = {
            ...validForm,
            threshold: null,
        };

        let emitted = false;
        service.updateAlarm('alarm-1', invalidForm).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(apiStub.updateAlarm).not.toHaveBeenCalled();
        expect(await firstValueFrom(service.error$)).toBe(
            'Dati del form non validi per l\'aggiornamento dell\'allarme.'
        );
    });

    it('updateAlarm in errore API imposta messaggio e mantiene lo stato invariato', async () => {
        apiStub.getAlarms.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarms();

        apiStub.updateAlarm.mockReturnValue(throwError(() => new Error('update failed')));

        let emitted = false;
        service.updateAlarm('alarm-1', validForm).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(await firstValueFrom(service.error$)).toBe('Errore durante l\'aggiornamento dell\'allarme.');
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA, alarmB]);
    });

    it('toggleEnabled aggiorna enabled costruendo payload dai dati locali', async () => {
        apiStub.getAlarms.mockReturnValue(of([alarmA]));
        service.loadAlarms();

        const toggledAlarm: AlarmRule = { ...alarmA, enabled: false };
        apiStub.updateAlarm.mockReturnValue(of(toggledAlarm));

        service.toggleEnabled('alarm-1', false).subscribe();

        expect(apiStub.updateAlarm).toHaveBeenCalledWith('alarm-1', {
            name: alarmA.name,
            priority: alarmA.priority,
            thresholdOperator: alarmA.thresholdOperator,
            threshold: String(alarmA.threshold),
            activationTime: alarmA.activationTime,
            deactivationTime: alarmA.deactivationTime,
            enabled: false,
        });

        expect(await firstValueFrom(service.alarms$)).toEqual([toggledAlarm]);
    });

    it('toggleEnabled su allarme assente non chiama API e imposta errore', async () => {
        apiStub.getAlarms.mockReturnValue(of([alarmA]));
        service.loadAlarms();

        let emitted = false;
        service.toggleEnabled('missing-id', true).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(apiStub.updateAlarm).not.toHaveBeenCalled();
        expect(await firstValueFrom(service.error$)).toBe('Allarme non trovato nello stato locale.');
    });

    it('toggleEnabled in errore API imposta messaggio e mantiene lo stato invariato', async () => {
        apiStub.getAlarms.mockReturnValue(of([alarmA]));
        service.loadAlarms();

        apiStub.updateAlarm.mockReturnValue(throwError(() => new Error('toggle failed')));

        let emitted = false;
        service.toggleEnabled('alarm-1', false).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(await firstValueFrom(service.error$)).toBe('Errore durante la modifica dello stato dell\'allarme.');
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA]);
    });

    it('deleteAlarm rimuove l allarme locale quando API conferma', async () => {
        apiStub.getAlarms.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarms();

        apiStub.deleteAlarm.mockReturnValue(of(void 0));

        let emitted = false;
        service.deleteAlarm('alarm-1').subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(true);
        expect(apiStub.deleteAlarm).toHaveBeenCalledWith('alarm-1');
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmB]);
    });

    it('deleteAlarm in errore API imposta messaggio e mantiene lo stato invariato', async () => {
        apiStub.getAlarms.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarms();

        apiStub.deleteAlarm.mockReturnValue(throwError(() => new Error('delete failed')));

        let emitted = false;
        service.deleteAlarm('alarm-1').subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(await firstValueFrom(service.error$)).toBe('Errore durante l\'eliminazione dell\'allarme.');
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA, alarmB]);
    });
});
