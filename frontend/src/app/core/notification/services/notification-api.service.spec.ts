import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { NotificationEvent } from '../../../features/notification/models/notification-event.model';
import { API_BASE_URL } from '../../tokens/api-base-url.token';
import { NotificationApiService } from './notification-api.service';

describe('NotificationApiService', () => {
    let service: NotificationApiService;
    let httpController: HttpTestingController;

    const apiBaseUrl = 'https://api.example.test';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                NotificationApiService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: API_BASE_URL, useValue: apiBaseUrl },
            ],
        });

        service = TestBed.inject(NotificationApiService);
        httpController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpController?.verify();
        TestBed.resetTestingModule();
    });

    it('getNotificationsHistory chiama GET /api/notifications e restituisce la lista', () => {
        const response: NotificationEvent[] = [
            {
                notificationId: 'n-1',
                title: 'Allarme antincendio',
                sentAt: '2026-03-24T10:00:00.000Z',
            },
        ];

        service.getNotificationsHistory().subscribe((result) => {
            expect(result).toEqual(response);
            expect(result).toHaveLength(1);
        });

        const request = httpController.expectOne(`${apiBaseUrl}/api/notifications`);
        expect(request.request.method).toBe('GET');
        request.flush(response);
    });

    it('getNotificationsHistory emette una volta e completa', () => {
        let emissions = 0;
        let completed = false;

        service.getNotificationsHistory().subscribe({
            next: () => {
                emissions += 1;
            },
            complete: () => {
                completed = true;
            },
        });

        const request = httpController.expectOne(`${apiBaseUrl}/api/notifications`);
        request.flush([]);

        expect(emissions).toBe(1);
        expect(completed).toBe(true);
    });

    it('getNotificationsHistory e cold: due sottoscrizioni producono due request HTTP distinte', () => {
        service.getNotificationsHistory().subscribe();
        service.getNotificationsHistory().subscribe();

        const requests = httpController.match(`${apiBaseUrl}/api/notifications`);
        expect(requests).toHaveLength(2);
        for (const request of requests) {
            expect(request.request.method).toBe('GET');
            request.flush([]);
        }
    });

    it('propaga errori HTTP al chiamante', () => {
        let receivedStatus: number | null = null;

        service.getNotificationsHistory().subscribe({
            next: () => {
                throw new Error('Non dovrebbe emettere next in caso di errore');
            },
            error: (error: HttpErrorResponse) => {
                receivedStatus = error.status;
            },
        });

        const request = httpController.expectOne(`${apiBaseUrl}/api/notifications`);
        request.flush('Server error', { status: 500, statusText: 'Server Error' });

        expect(receivedStatus).toBe(500);
    });
});
