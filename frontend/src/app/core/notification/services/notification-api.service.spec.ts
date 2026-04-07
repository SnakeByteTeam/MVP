import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UserRole } from '../../models/user-role.enum';
import { InternalAuthService } from '../../services/internal-auth.service';
import type { NotificationEvent } from '../../../features/notification/models/notification-event.model';
import { API_BASE_URL } from '../../tokens/api-base-url.token';
import { NotificationApiService } from './notification-api.service';

describe('NotificationApiService', () => {
    let service: NotificationApiService;
    let httpController: HttpTestingController;
    let authServiceMock: Pick<InternalAuthService, 'getCurrentUser$'>;

    const apiBaseUrl = 'https://api.example.test';

    beforeEach(() => {
        authServiceMock = {
            getCurrentUser$: () =>
                of({
                    userId: '7',
                    username: 'oss-user',
                    role: UserRole.OPERATORE_SANITARIO,
                    accessToken: 'token',
                    isFirstAccess: false,
                }),
        };

        TestBed.configureTestingModule({
            providers: [
                NotificationApiService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: API_BASE_URL, useValue: apiBaseUrl },
                { provide: InternalAuthService, useValue: authServiceMock },
            ],
        });

        service = TestBed.inject(NotificationApiService);
        httpController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpController?.verify();
        TestBed.resetTestingModule();
    });

    it('getNotificationsHistory chiama managed/unmanaged e mappa verso NotificationEvent', () => {
        const managedResponse = [
            {
                id: 'alarm-managed-1',
                activationTime: '2026-03-24T10:00:00.000Z',
                resolutionTime: null,
            },
        ];

        const unmanagedResponse = [
            {
                id: 'alarm-unmanaged-1',
                activationTime: '2026-03-24T09:00:00.000Z',
                resolutionTime: '2026-03-24T09:05:00.000Z',
            },
        ];

        const expected: NotificationEvent[] = [
            {
                notificationId: 'alarm-triggered-alarm-managed-1',
                title: "C'e un allarme in corso",
                sentAt: '2026-03-24T10:00:00.000Z',
            },
            {
                notificationId: 'alarm-resolved-alarm-unmanaged-1',
                title: 'Allarme risolto',
                sentAt: '2026-03-24T09:05:00.000Z',
            },
        ];

        service.getNotificationsHistory().subscribe((result) => {
            expect(result).toEqual(expected);
        });

        const managedRequest = httpController.expectOne(
            `${apiBaseUrl}/alarm-events/managed/7/100/0`
        );
        expect(managedRequest.request.method).toBe('GET');

        const unmanagedRequest = httpController.expectOne(
            `${apiBaseUrl}/alarm-events/unmanaged/7/100/0`
        );
        expect(unmanagedRequest.request.method).toBe('GET');

        managedRequest.flush(managedResponse);
        unmanagedRequest.flush(unmanagedResponse);
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

        const managedRequest = httpController.expectOne(
            `${apiBaseUrl}/alarm-events/managed/7/100/0`
        );
        const unmanagedRequest = httpController.expectOne(
            `${apiBaseUrl}/alarm-events/unmanaged/7/100/0`
        );

        managedRequest.flush([]);
        unmanagedRequest.flush([]);

        expect(emissions).toBe(1);
        expect(completed).toBe(true);
    });

    it('getNotificationsHistory e cold: due sottoscrizioni producono due coppie di request HTTP', () => {
        service.getNotificationsHistory().subscribe();
        service.getNotificationsHistory().subscribe();

        const requests = httpController.match(
            (request) =>
                request.url === `${apiBaseUrl}/alarm-events/managed/7/100/0` ||
                request.url === `${apiBaseUrl}/alarm-events/unmanaged/7/100/0`
        );

        expect(requests).toHaveLength(4);
        for (const request of requests) {
            expect(request.request.method).toBe('GET');
            request.flush([]);
        }
    });

    it('se una delle due endpoint fallisce, effettua fallback a lista vuota per quella sorgente', () => {
        let result: NotificationEvent[] | null = null;

        service.getNotificationsHistory().subscribe((notifications) => {
            result = notifications;
        });

        const managedRequest = httpController.expectOne(
            `${apiBaseUrl}/alarm-events/managed/7/100/0`
        );
        const unmanagedRequest = httpController.expectOne(
            `${apiBaseUrl}/alarm-events/unmanaged/7/100/0`
        );

        managedRequest.flush('Server error', { status: 500, statusText: 'Server Error' });
        unmanagedRequest.flush([
            {
                id: 'alarm-unmanaged-2',
                activationTime: '2026-03-24T09:00:00.000Z',
                resolutionTime: null,
            },
        ]);

        expect(result).toEqual([
            {
                notificationId: 'alarm-triggered-alarm-unmanaged-2',
                title: "C'e un allarme in corso",
                sentAt: '2026-03-24T09:00:00.000Z',
            },
        ]);
    });

    it('se non c e sessione attiva restituisce [] senza chiamate HTTP', () => {
        authServiceMock.getCurrentUser$ = () => of(null);
        TestBed.resetTestingModule();

        TestBed.configureTestingModule({
            providers: [
                NotificationApiService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: API_BASE_URL, useValue: apiBaseUrl },
                { provide: InternalAuthService, useValue: authServiceMock },
            ],
        });

        service = TestBed.inject(NotificationApiService);
        httpController = TestBed.inject(HttpTestingController);

        service.getNotificationsHistory().subscribe((result) => {
            expect(result).toEqual([]);
        });

        const requests = httpController.match(() => true);
        expect(requests).toHaveLength(0);
    });
});
