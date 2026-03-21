import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AlarmPriority } from '../models/alarm-priority.enum';
import type { AlarmRule } from '../models/alarm-rule.model';
import type { CreateAlarmRequestDto } from '../models/dto/create-alarm-request.model.dto';
import { ThresholdOperator } from '../models/threshold-operator.enum';
import type { UpdateAlarmRequestDto } from '../models/dto/update-alarm-request.model.dto';
import { AlarmApiService } from './alarm-api.service';

describe('AlarmApiService', () => {
    let service: AlarmApiService;
    let httpController: HttpTestingController;

    const baseUrl = '/api/alarms';

    const alarm: AlarmRule = {
        id: 'alarm-1',
        name: 'Temperatura alta',
        apartmentId: 'apt-1',
        deviceId: 'device-1',
        priority: AlarmPriority.RED,
        thresholdOperator: ThresholdOperator.GREATER_THAN,
        threshold: 30,
        activationTime: '08:00',
        deactivationTime: '20:00',
        enabled: true,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AlarmApiService, provideHttpClient(), provideHttpClientTesting()],
        });

        service = TestBed.inject(AlarmApiService);
        httpController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpController.verify();
    });

    it('getAlarms chiama GET /api/alarms e restituisce la lista', () => {
        service.getAlarms().subscribe((result) => {
            expect(result).toEqual([alarm]);
            expect(result).toHaveLength(1);
        });

        const request = httpController.expectOne(baseUrl);
        expect(request.request.method).toBe('GET');
        request.flush([alarm]);
    });

    it('getAlarm chiama GET /api/alarms/:id e restituisce il dettaglio', () => {
        service.getAlarm('alarm-1').subscribe((result) => {
            expect(result).toEqual(alarm);
            expect(result.id).toBe('alarm-1');
        });

        const request = httpController.expectOne(`${baseUrl}/alarm-1`);
        expect(request.request.method).toBe('GET');
        request.flush(alarm);
    });

    it('createAlarm chiama POST /api/alarms con payload corretto', () => {
        const payload: CreateAlarmRequestDto = {
            name: 'Nuovo allarme',
            apartmentId: 'apt-1',
            deviceId: 'device-7',
            priority: AlarmPriority.GREEN,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            threshold: '22',
            activationTime: '09:00',
            deactivationTime: '18:00',
        };

        service.createAlarm(payload).subscribe((result) => {
            expect(result).toEqual(alarm);
        });

        const request = httpController.expectOne(baseUrl);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(payload);
        request.flush(alarm);
    });

    it('updateAlarm chiama PATCH /api/alarms/:id con payload corretto', () => {
        const payload: UpdateAlarmRequestDto = {
            name: 'Allarme aggiornato',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: ThresholdOperator.LESS_THAN,
            threshold: '15',
            activationTime: '00:00',
            deactivationTime: '23:59',
            enabled: false,
        };

        service.updateAlarm('alarm-2', payload).subscribe((result) => {
            expect(result).toEqual(alarm);
        });

        const request = httpController.expectOne(`${baseUrl}/alarm-2`);
        expect(request.request.method).toBe('PATCH');
        expect(request.request.body).toEqual(payload);
        request.flush(alarm);
    });

    it('deleteAlarm chiama DELETE /api/alarms/:id', () => {
        service.deleteAlarm('alarm-3').subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(`${baseUrl}/alarm-3`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('resolveAlarm chiama PATCH /api/active-alarms/:id/resolve', () => {
        service.resolveAlarm('active-1').subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne('/api/active-alarms/active-1/resolve');
        expect(request.request.method).toBe('PATCH');
        expect(request.request.body).toEqual({});
        request.flush(null);
    });

    it('propaga l errore HTTP al chiamante', () => {
        let receivedStatus: number | null = null;

        service.getAlarm('missing').subscribe({
            next: () => {
                throw new Error('Non dovrebbe emettere next in caso di errore');
            },
            error: (error: HttpErrorResponse) => {
                receivedStatus = error.status;
            },
        });

        const request = httpController.expectOne(`${baseUrl}/missing`);
        request.flush('Not found', { status: 404, statusText: 'Not Found' });

        expect(receivedStatus).toBe(404);
    });
});
