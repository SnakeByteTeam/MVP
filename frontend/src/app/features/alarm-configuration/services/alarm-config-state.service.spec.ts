import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import type { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import type { AlarmConfigFormValue } from '../models/alarm-config-form-value.model';
import { AlarmConfigStateService } from './alarm-config-state.service';

describe('AlarmConfigStateService', () => {
    let service: AlarmConfigStateService;

    const apiStub = {
        getAlarmRules: vi.fn(),
        getAlarmRule: vi.fn(),
        createAlarmRule: vi.fn(),
        updateAlarmRule: vi.fn(),
        deleteAlarmRule: vi.fn(),
    };

    const alarmA: AlarmRule = {
        id: 'alarm-1',
        name: 'Temperatura stanza',
        thresholdOperator: '>',
        thresholdValue: '30',
        priority: AlarmPriority.RED,
        armingTime: '08:00:00',
        dearmingTime: '20:00:00',
        isArmed: true,
        deviceId: 'dev-1',
    };

    const alarmB: AlarmRule = {
        id: 'alarm-2',
        name: 'Umidita critica',
        thresholdOperator: '<',
        thresholdValue: '10',
        priority: AlarmPriority.ORANGE,
        armingTime: '00:00:00',
        dearmingTime: '23:59:00',
        isArmed: false,
        deviceId: 'dev-2',
    };

    const validForm: AlarmConfigFormValue = {
        name: '  Nuovo allarme  ',
        sensorId: 'dev-3',
        priority: AlarmPriority.GREEN,
        thresholdOperator: ThresholdOperator.EQUAL_TO,
        threshold: 22,
        armingTime: '09:00',
        dearmingTime: '18:00',
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

    it('loadAlarmRules aggiorna stato locale quando API risponde con successo', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA, alarmB]));

        service.loadAlarmRules();

        const alarms = await firstValueFrom(service.alarms$);
        expect(apiStub.getAlarmRules).toHaveBeenCalledTimes(1);
        expect(alarms).toEqual([alarmA, alarmB]);
        expect(alarms).toHaveLength(2);
        expect(await firstValueFrom(service.error$)).toBeNull();
    });

    it('loadAlarmRules espone messaggio errore e pulisce error precedente al retry', async () => {
        apiStub.getAlarmRules.mockReturnValueOnce(throwError(() => new Error('network')));

        service.loadAlarmRules();
        expect(await firstValueFrom(service.error$)).toBe('Errore durante il caricamento degli allarmi.');

        apiStub.getAlarmRules.mockReturnValueOnce(of([alarmA]));
        service.loadAlarmRules();

        expect(await firstValueFrom(service.error$)).toBeNull();
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA]);
    });

    it('getAlarmRuleById inoltra il valore di API in caso di successo', () => {
        apiStub.getAlarmRule.mockReturnValue(of(alarmA));

        let result: AlarmRule | null = null;
        service.getAlarmRuleById('alarm-1').subscribe((alarm) => {
            result = alarm;
        });

        expect(apiStub.getAlarmRule).toHaveBeenCalledWith('alarm-1');
        expect(result).toEqual(alarmA);
    });

    it('getAlarmRuleById in errore imposta messaggio e completa senza emissioni', async () => {
        apiStub.getAlarmRule.mockReturnValue(throwError(() => new Error('404')));

        let emitted = false;
        service.getAlarmRuleById('missing').subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(await firstValueFrom(service.error$)).toBe('Errore durante il recupero dell\'allarme.');
    });

    it('createAlarmRule mappa il payload, chiama API e aggiunge il nuovo allarme allo stato', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA]));
        service.loadAlarmRules();

        apiStub.createAlarmRule.mockReturnValue(of(alarmB));

        let created: AlarmRule | null = null;
        service.createAlarmRule(validForm).subscribe((alarm) => {
            created = alarm;
        });

        expect(apiStub.createAlarmRule).toHaveBeenCalledWith({
            name: 'Nuovo allarme',
            deviceId: 'dev-3',
            priority: AlarmPriority.GREEN,
            thresholdOperator: '=',
            thresholdValue: '22',
            armingTime: '09:00',
            dearmingTime: '18:00',
        });
        expect(created).toEqual(alarmB);
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA, alarmB]);
    });

    it('createAlarmRule con form invalido non chiama API e imposta errore di validazione', async () => {
        const invalidForm: AlarmConfigFormValue = {
            ...validForm,
            name: '   ',
        };

        let emitted = false;
        service.createAlarmRule(invalidForm).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(apiStub.createAlarmRule).not.toHaveBeenCalled();
        expect(await firstValueFrom(service.error$)).toBe(
            'Dati del form non validi per la creazione dell\'allarme.'
        );
    });

    it('createAlarmRule in errore API imposta messaggio e non altera lo stato locale', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA]));
        service.loadAlarmRules();

        apiStub.createAlarmRule.mockReturnValue(throwError(() => new Error('create failed')));

        let emitted = false;
        service.createAlarmRule(validForm).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(await firstValueFrom(service.error$)).toBe('Errore durante la creazione dell\'allarme.');
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA]);
    });

    it('updateAlarmRule mappa payload update e sostituisce l allarme nello stato', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarmRules();

        const updatedAlarm: AlarmRule = { ...alarmA, name: 'Temperatura reparto', thresholdValue: '35' };
        apiStub.updateAlarmRule.mockReturnValue(of(updatedAlarm));

        service.updateAlarmRule('alarm-1', validForm).subscribe();

        expect(apiStub.updateAlarmRule).toHaveBeenCalledWith('alarm-1', {
            priority: AlarmPriority.GREEN,
            thresholdOperator: '=',
            thresholdValue: '22',
            armingTime: '09:00',
            dearmingTime: '18:00',
            isArmed: true,
        });

        expect(await firstValueFrom(service.alarms$)).toEqual([updatedAlarm, alarmB]);
    });

    it('updateAlarmRule con form invalido non chiama API e imposta errore', async () => {
        const invalidForm: AlarmConfigFormValue = {
            ...validForm,
            threshold: null,
        };

        let emitted = false;
        service.updateAlarmRule('alarm-1', invalidForm).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(apiStub.updateAlarmRule).not.toHaveBeenCalled();
        expect(await firstValueFrom(service.error$)).toBe(
            'Dati del form non validi per l\'aggiornamento dell\'allarme.'
        );
    });

    it('updateAlarmRule in errore API imposta messaggio e mantiene lo stato invariato', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarmRules();

        apiStub.updateAlarmRule.mockReturnValue(throwError(() => new Error('update failed')));

        let emitted = false;
        service.updateAlarmRule('alarm-1', validForm).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(await firstValueFrom(service.error$)).toBe('Errore durante l\'aggiornamento dell\'allarme.');
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA, alarmB]);
    });

    it('toggleEnabled aggiorna enabled costruendo payload dai dati locali', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA]));
        service.loadAlarmRules();

        const toggledAlarm: AlarmRule = { ...alarmA, isArmed: false };
        apiStub.updateAlarmRule.mockReturnValue(of(toggledAlarm));

        service.toggleEnabled('alarm-1', false).subscribe();

        expect(apiStub.updateAlarmRule).toHaveBeenCalledWith('alarm-1', {
            priority: alarmA.priority,
            thresholdOperator: alarmA.thresholdOperator,
            thresholdValue: alarmA.thresholdValue,
            armingTime: '08:00',
            dearmingTime: '20:00',
            isArmed: false,
        });

        expect(await firstValueFrom(service.alarms$)).toEqual([toggledAlarm]);
    });

    it('toggleEnabled su allarme assente non chiama API e imposta errore', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA]));
        service.loadAlarmRules();

        let emitted = false;
        service.toggleEnabled('missing-id', true).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(apiStub.updateAlarmRule).not.toHaveBeenCalled();
        expect(await firstValueFrom(service.error$)).toBe('Allarme non trovato nello stato locale.');
    });

    it('toggleEnabled in errore API imposta messaggio e mantiene lo stato invariato', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA]));
        service.loadAlarmRules();

        apiStub.updateAlarmRule.mockReturnValue(throwError(() => new Error('toggle failed')));

        let emitted = false;
        service.toggleEnabled('alarm-1', false).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(await firstValueFrom(service.error$)).toBe('Errore durante la modifica dello stato dell\'allarme.');
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA]);
    });

    it('deleteAlarmRule rimuove l allarme locale quando API conferma', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarmRules();

        apiStub.deleteAlarmRule.mockReturnValue(of(void 0));

        let emitted = false;
        service.deleteAlarmRule('alarm-1').subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(true);
        expect(apiStub.deleteAlarmRule).toHaveBeenCalledWith('alarm-1');
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmB]);
    });

    it('deleteAlarmRule in errore API imposta messaggio e mantiene lo stato invariato', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarmRules();

        apiStub.deleteAlarmRule.mockReturnValue(throwError(() => new Error('delete failed')));

        let emitted = false;
        service.deleteAlarmRule('alarm-1').subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(await firstValueFrom(service.error$)).toBe('Errore durante l\'eliminazione dell\'allarme.');
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA, alarmB]);
    });
});
