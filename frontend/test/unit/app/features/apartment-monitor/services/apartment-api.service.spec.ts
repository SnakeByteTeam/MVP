import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalAuthService } from 'src/app/core/services/internal-auth.service';
import { WardRealtimeCacheService } from 'src/app/core/alarm/services/ward-realtime-cache.service';
import { API_BASE_URL } from 'src/app/core/tokens/api-base-url.token';
import { ApartmentApiService } from 'src/app/features/apartment-monitor/services/apartment-api.service';

describe('ApartmentApiService', () => {
    let service: ApartmentApiService;
    let httpMock: HttpTestingController;

    const internalAuthStub = {
        getCurrentUser$: vi.fn(() => of(null)),
    };

    const wardRealtimeCacheStub = {
        mergeWardIds: vi.fn(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ApartmentApiService,
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
                { provide: InternalAuthService, useValue: internalAuthStub },
                { provide: WardRealtimeCacheService, useValue: wardRealtimeCacheStub },
            ],
        });

        service = TestBed.inject(ApartmentApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('RF83-OBL abilita un appartamento nel Sistema', async () => {
        const enablePromise = firstValueFrom(service.enableApartment('apt-101'));

        const request = httpMock.expectOne('http://localhost:3000/apartments/apt-101/enable');
        expect(request.request.method).toBe('PATCH');
        expect(request.request.body).toEqual({});

        request.flush(null, { status: 200, statusText: 'OK' });

        await enablePromise;
    });

    it('RF84-OBL disabilita un appartamento nel Sistema', async () => {
        const disablePromise = firstValueFrom(service.disableApartment('apt-101'));

        const request = httpMock.expectOne('http://localhost:3000/apartments/apt-101/disable');
        expect(request.request.method).toBe('PATCH');
        expect(request.request.body).toEqual({});

        request.flush(null, { status: 200, statusText: 'OK' });

        await disablePromise;
    });
});
