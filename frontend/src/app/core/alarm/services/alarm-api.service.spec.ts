import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AlarmPriority } from '../models/alarm-priority.enum';
import type { AlarmRule } from '../models/alarm-rule.model';
import type { ActiveAlarm } from '../models/active-alarm.model';
import type { CreateAlarmRuleRequestDto } from '../models/dto/create-alarm-rule-request.model.dto';
import type { UpdateAlarmRuleRequestDto } from '../models/dto/update-alarm-rule-request.model.dto';
import { API_BASE_URL } from '../../tokens/api-base-url.token';
import { AlarmApiService } from './alarm-api.service';

describe('AlarmApiService', () => {
    let service: AlarmApiService;
    let httpController: HttpTestingController;

    const apiBaseUrl = 'http://localhost:3000';
    const alarmRulesBaseUrl = `${apiBaseUrl}/alarm-rules`;
    const alarmEventsBaseUrl = `${apiBaseUrl}/alarm-events`;

    const alarm: AlarmRule = {
        id: 'alarm-1',
        name: 'Temperatura alta',
        thresholdOperator: '>',
        thresholdValue: '30',
        priority: AlarmPriority.RED,
        armingTime: '08:00:00',
        dearmingTime: '20:00:00',
        isArmed: true,
        deviceId: 'device-1',
    };

    const activeAlarm: ActiveAlarm = {
        id: 'active-1',
        alarmRuleId: 'alarm-1',
        alarmName: 'Temperatura alta',
        priority: AlarmPriority.RED,
        activationTime: '2026-03-24T10:00:00.000Z',
        resolutionTime: null,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AlarmApiService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: API_BASE_URL, useValue: apiBaseUrl },
            ],
        });

        service = TestBed.inject(AlarmApiService);
        httpController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpController.verify();
    });

    it('getAlarmRules chiama GET /alarm-rules e restituisce la lista', () => {
        service.getAlarmRules().subscribe((result) => {
            expect(result).toEqual([alarm]);
            expect(result).toHaveLength(1);
        });

        const request = httpController.expectOne(alarmRulesBaseUrl);
        expect(request.request.method).toBe('GET');
        request.flush([alarm]);
    });

    it('getAlarmRule chiama GET /alarm-rules/:id e restituisce il dettaglio', () => {
        service.getAlarmRule('alarm-1').subscribe((result) => {
            expect(result).toEqual(alarm);
            expect(result.id).toBe('alarm-1');
        });

        const request = httpController.expectOne(`${alarmRulesBaseUrl}/alarm-1`);
        expect(request.request.method).toBe('GET');
        request.flush(alarm);
    });

    it('getAlarmRule codifica id con caratteri riservati', () => {
        service.getAlarmRule('alarm/1').subscribe((result) => {
            expect(result).toEqual(alarm);
        });

        const request = httpController.expectOne(`${alarmRulesBaseUrl}/alarm%2F1`);
        expect(request.request.method).toBe('GET');
        request.flush(alarm);
    });

    it('createAlarmRule chiama POST /alarm-rules con payload corretto', () => {
        const payload: CreateAlarmRuleRequestDto = {
            name: 'Nuovo allarme',
            deviceId: 'device-7',
            priority: AlarmPriority.GREEN,
            thresholdOperator: '=',
            thresholdValue: '22',
            armingTime: '09:00',
            dearmingTime: '18:00',
        };

        service.createAlarmRule(payload).subscribe((result) => {
            expect(result).toEqual(alarm);
        });

        const request = httpController.expectOne(alarmRulesBaseUrl);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(payload);
        request.flush(alarm);
    });

    it('updateAlarmRule chiama PUT /alarm-rules/:id con payload corretto', () => {
        const payload: UpdateAlarmRuleRequestDto = {
            priority: AlarmPriority.ORANGE,
            thresholdOperator: '<',
            thresholdValue: '15',
            armingTime: '00:00',
            dearmingTime: '23:59',
            isArmed: false,
        };

        service.updateAlarmRule('alarm-2', payload).subscribe((result) => {
            expect(result).toEqual(alarm);
        });

        const request = httpController.expectOne(`${alarmRulesBaseUrl}/alarm-2`);
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual(payload);
        request.flush(alarm);
    });

    it('deleteAlarmRule chiama DELETE /alarm-rules/:id', () => {
        service.deleteAlarmRule('alarm-3').subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(`${alarmRulesBaseUrl}/alarm-3`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('getActiveAlarms chiama GET /alarm-events e restituisce la lista', () => {
        service.getActiveAlarms().subscribe((result) => {
            expect(result).toEqual([activeAlarm]);
            expect(result).toHaveLength(1);
        });

        const request = httpController.expectOne(alarmEventsBaseUrl);
        expect(request.request.method).toBe('GET');
        request.flush([activeAlarm]);
    });

    it('getActiveAlarmsOfOperator chiama GET /alarm-events/:userId', () => {
        service.getActiveAlarmsOfOperator('operator-7').subscribe((result) => {
            expect(result).toEqual([activeAlarm]);
            expect(result).toHaveLength(1);
        });

        const request = httpController.expectOne(`${alarmEventsBaseUrl}/operator-7`);
        expect(request.request.method).toBe('GET');
        request.flush([activeAlarm]);
    });

    it('resolveAlarm chiama POST /alarm-events/resolve', () => {
        service.resolveAlarm('active-1', 7).subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(`${alarmEventsBaseUrl}/resolve`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ alarmId: 'active-1', userId: 7 });
        request.flush(null);
    });

    it('resolveAlarm invia alarmId nel body anche con caratteri riservati', () => {
        service.resolveAlarm('active/1', 9).subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(`${alarmEventsBaseUrl}/resolve`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ alarmId: 'active/1', userId: 9 });
        request.flush(null);
    });

    it('propaga l errore HTTP al chiamante', () => {
        let receivedStatus: number | null = null;

        service.getAlarmRule('missing').subscribe({
            next: () => {
                throw new Error('Non dovrebbe emettere next in caso di errore');
            },
            error: (error: HttpErrorResponse) => {
                receivedStatus = error.status;
            },
        });

        const request = httpController.expectOne(`${alarmRulesBaseUrl}/missing`);
        request.flush('Not found', { status: 404, statusText: 'Not Found' });

        expect(receivedStatus).toBe(404);
    });
});
