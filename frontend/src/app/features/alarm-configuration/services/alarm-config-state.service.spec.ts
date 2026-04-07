import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import type { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import { AlarmManagementRefreshService } from '../../../core/alarm/services/alarm-management-refresh.service';
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

    const refreshServiceStub = {
        requestRefresh: vi.fn(),
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
        plantId: 'plant-1',
        deviceId: 'dev-3',
        priority: AlarmPriority.GREEN,
        thresholdOperator: ThresholdOperator.EQUAL_TO,
        thresholdValue: '22',
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
                { provide: AlarmManagementRefreshService, useValue: refreshServiceStub },
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
            plantId: 'plant-1',
            priority: AlarmPriority.GREEN,
            thresholdOperator: '=',
            thresholdValue: '22',
            armingTime: '09:00',
            dearmingTime: '18:00',
        });
        expect(created).toEqual(alarmB);
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmA, alarmB]);
        expect(refreshServiceStub.requestRefresh).toHaveBeenCalledTimes(1);
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
        expect(refreshServiceStub.requestRefresh).not.toHaveBeenCalled();
    });

    it('createAlarmRule pulisce l errore precedente quando una creazione successiva va a buon fine', async () => {
        const invalidForm: AlarmConfigFormValue = {
            ...validForm,
            name: '   ',
        };

        service.createAlarmRule(invalidForm).subscribe();
        expect(await firstValueFrom(service.error$)).toBe(
            'Dati del form non validi per la creazione dell\'allarme.'
        );

        apiStub.createAlarmRule.mockReturnValueOnce(of(alarmB));
        service.createAlarmRule(validForm).subscribe();

        expect(await firstValueFrom(service.error$)).toBeNull();
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmB]);
    });

    it('updateAlarmRule mantiene il nome originale nel payload update e sostituisce l allarme nello stato', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarmRules();

        const updatedAlarm: AlarmRule = { ...alarmA, name: 'Temperatura reparto', thresholdValue: '35' };
        apiStub.updateAlarmRule.mockReturnValue(of(updatedAlarm));

        service.updateAlarmRule('alarm-1', validForm).subscribe();

        expect(apiStub.updateAlarmRule).toHaveBeenCalledWith('alarm-1', {
            name: 'Temperatura stanza',
            priority: AlarmPriority.GREEN,
            thresholdOperator: '=',
            thresholdValue: '22',
            armingTime: '09:00',
            dearmingTime: '18:00',
            isArmed: true,
        });

        expect(await firstValueFrom(service.alarms$)).toEqual([updatedAlarm, alarmB]);
        expect(refreshServiceStub.requestRefresh).toHaveBeenCalledTimes(1);
    });

    it('updateAlarmRule con form invalido non chiama API e imposta errore', async () => {
        const invalidForm: AlarmConfigFormValue = {
            ...validForm,
            thresholdValue: '',
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
        expect(refreshServiceStub.requestRefresh).not.toHaveBeenCalled();
    });

    it('updateAlarmRule senza allarme locale usa il nome del form nel payload', async () => {
        const updatedAlarm: AlarmRule = {
            ...alarmA,
            id: 'missing-id',
            name: 'Nome dal form',
            deviceId: 'dev-10',
            thresholdValue: '44',
        };
        apiStub.updateAlarmRule.mockReturnValueOnce(of(updatedAlarm));

        service
            .updateAlarmRule('missing-id', {
                ...validForm,
                name: ' Nome dal form ',
                deviceId: ' dev-10 ',
                thresholdOperator: ThresholdOperator.GREATER_THAN,
                thresholdValue: '44',
            })
            .subscribe();

        expect(apiStub.updateAlarmRule).toHaveBeenCalledWith('missing-id', {
            name: 'Nome dal form',
            priority: AlarmPriority.GREEN,
            thresholdOperator: '>',
            thresholdValue: '44',
            armingTime: '09:00',
            dearmingTime: '18:00',
            isArmed: true,
        });
    });

    it('updateAlarmRule sostituisce la riga locale anche se il backend ritorna un nuovo id', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarmRules();

        const updatedWithNewId: AlarmRule = {
            ...alarmA,
            id: 'alarm-1-v2',
            isArmed: false,
        };
        apiStub.updateAlarmRule.mockReturnValue(of(updatedWithNewId));

        service.updateAlarmRule('alarm-1', validForm).subscribe();

        const alarms = await firstValueFrom(service.alarms$);
        expect(alarms).toEqual([updatedWithNewId, alarmB]);
        expect(alarms.some((alarm) => alarm.id === 'alarm-1')).toBe(false);
        expect(alarms.some((alarm) => alarm.id === 'alarm-1-v2')).toBe(true);
        expect(refreshServiceStub.requestRefresh).toHaveBeenCalledTimes(1);
    });

    it('toggleEnabled aggiorna enabled costruendo payload dai dati locali', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA]));
        service.loadAlarmRules();

        const toggledAlarm: AlarmRule = { ...alarmA, isArmed: false };
        apiStub.updateAlarmRule.mockReturnValue(of(toggledAlarm));

        service.toggleEnabled('alarm-1', false).subscribe();

        expect(apiStub.updateAlarmRule).toHaveBeenCalledWith('alarm-1', {
            name: alarmA.name,
            priority: alarmA.priority,
            thresholdOperator: alarmA.thresholdOperator,
            thresholdValue: alarmA.thresholdValue,
            armingTime: '08:00',
            dearmingTime: '20:00',
            isArmed: false,
        });

        expect(await firstValueFrom(service.alarms$)).toEqual([toggledAlarm]);
        expect(refreshServiceStub.requestRefresh).toHaveBeenCalledTimes(1);
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
        expect(refreshServiceStub.requestRefresh).not.toHaveBeenCalled();
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
        expect(refreshServiceStub.requestRefresh).not.toHaveBeenCalled();
    });

    it('toggleEnabled aggiorna subito lo stato locale anche se il backend ritorna un nuovo id', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarmRules();

        const toggledWithNewId: AlarmRule = {
            ...alarmA,
            id: 'alarm-1-v2',
            isArmed: false,
        };
        apiStub.updateAlarmRule.mockReturnValue(of(toggledWithNewId));

        service.toggleEnabled('alarm-1', false).subscribe();

        const alarms = await firstValueFrom(service.alarms$);
        expect(alarms).toEqual([toggledWithNewId, alarmB]);
        expect(alarms.some((alarm) => alarm.id === 'alarm-1')).toBe(false);
        expect(alarms.some((alarm) => alarm.id === 'alarm-1-v2')).toBe(true);
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
        expect(refreshServiceStub.requestRefresh).toHaveBeenCalledTimes(1);
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
        expect(refreshServiceStub.requestRefresh).not.toHaveBeenCalled();
    });

    it('deleteAlarmRule pulisce errore precedente quando un delete successivo riesce', async () => {
        apiStub.getAlarmRules.mockReturnValue(of([alarmA, alarmB]));
        service.loadAlarmRules();

        apiStub.deleteAlarmRule.mockReturnValueOnce(throwError(() => new Error('delete failed')));
        service.deleteAlarmRule('alarm-1').subscribe();
        expect(await firstValueFrom(service.error$)).toBe('Errore durante l\'eliminazione dell\'allarme.');

        apiStub.deleteAlarmRule.mockReturnValueOnce(of(void 0));
        service.deleteAlarmRule('alarm-1').subscribe();

        expect(await firstValueFrom(service.error$)).toBeNull();
        expect(await firstValueFrom(service.alarms$)).toEqual([alarmB]);
        expect(refreshServiceStub.requestRefresh).toHaveBeenCalledTimes(1);
    });
});
