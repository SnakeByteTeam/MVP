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
    let storage: {
        getItem: (key: string) => string | null;
        setItem: (key: string, value: string) => void;
        removeItem: (key: string) => void;
        clear: () => void;
    };

    const internalAuthStub = {
        getCurrentUser$: vi.fn<() => any>(() => of(null)),
    };

    const wardRealtimeCacheStub = {
        mergeWardIds: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        const values = new Map<string, string>();
        storage = {
            getItem: (key: string) => values.get(key) ?? null,
            setItem: (key: string, value: string) => {
                values.set(key, value);
            },
            removeItem: (key: string) => {
                values.delete(key);
            },
            clear: () => {
                values.clear();
            },
        };

        Object.defineProperty(globalThis, 'localStorage', {
            value: storage,
            configurable: true,
        });

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
        httpMock?.verify();
        storage?.clear();
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

    it('RF72-OBL getAvailableApartments ordina per nome e deduplica plant', async () => {
        const apartmentsPromise = firstValueFrom(service.getAvailableApartments());

        const request = httpMock.expectOne('http://localhost:3000/plant/all');
        expect(request.request.method).toBe('GET');
        request.flush([
            { id: 'p2', name: 'Zeta', rooms: [] },
            { id: 'p1', name: 'Alfa', rooms: [] },
            { id: 'p1', name: 'Alfa', rooms: [] },
        ]);

        const apartments = await apartmentsPromise;
        expect(apartments).toEqual([
            { id: 'p1', name: 'Alfa' },
            { id: 'p2', name: 'Zeta' },
        ]);
    });

    it('RF72-OBL getAllPlants supporta risposta wrappata in data[]', async () => {
        const plantsPromise = firstValueFrom(service.getAllPlants());

        const request = httpMock.expectOne('http://localhost:3000/plant/all');
        request.flush({
            data: [
                { id: 'p9', name: 'Plant 9', rooms: [] },
                { id: 'p10', rooms: [] },
            ],
        });

        const plants = await plantsPromise;
        expect(plants).toHaveLength(2);
        expect(plants[1].name).toBe('p10');
    });

    it('RF72-OBL getCurrentApartment usa activePlantId salvato e mappa apartment view', async () => {
        globalThis.localStorage.setItem('activePlantId', 'p2');
        const apartmentPromise = firstValueFrom(service.getCurrentApartment());

        const allPlantsRequest = httpMock.expectOne('http://localhost:3000/plant/all');
        allPlantsRequest.flush([
            { id: 'p1', name: 'Plant 1', rooms: [] },
            { id: 'p2', name: 'Plant 2', rooms: [] },
        ]);

        const plantRequest = httpMock.expectOne('http://localhost:3000/plant?plantid=p2');
        plantRequest.flush({
            id: 'p2',
            name: 'Plant 2',
            rooms: [
                {
                    id: 'r1',
                    name: 'Ingresso',
                    devices: [
                        {
                            id: 'd-energy',
                            name: 'Contatore',
                            type: 'SS_ENERGY_MEASURE_TOTAL',
                            subType: 'SF_ENERGY',
                            datapoints: [],
                        },
                        {
                            id: 'd-main',
                            name: 'Sensore Porta',
                            type: 'SS_SECURITY_RADARDETECTOR',
                            subType: 'SF_ACCESS',
                            datapoints: [
                                {
                                    id: 'dp-1',
                                    name: 'State',
                                    readable: true,
                                    writable: false,
                                    valueType: 'string',
                                    sfeType: 'SFE_State',
                                },
                            ],
                        },
                        {
                            id: 'd-dup',
                            name: ' sensore porta ',
                            type: 'SS_AUTOMATION_ONOFF',
                            subType: 'SF_GENERIC',
                            datapoints: [],
                        },
                    ],
                },
            ],
        });

        const apartment = await apartmentPromise;
        expect(apartment.id).toBe('p2');
        expect(apartment.rooms).toHaveLength(1);
        expect(apartment.rooms[0].devices).toHaveLength(1);
        expect(apartment.rooms[0].devices[0].id).toBe('d-main');
    });

    it('RF72-OBL getCurrentApartment fallisce se non esistono plant disponibili', async () => {
        const apartmentPromise = firstValueFrom(service.getCurrentApartment());

        const allPlantsRequest = httpMock.expectOne('http://localhost:3000/plant/all');
        allPlantsRequest.flush([]);

        await expect(apartmentPromise).rejects.toThrow('No available plants found');
    });

    it('RF72-OBL setActivePlantId non emette evento se plant invariato', () => {
        globalThis.localStorage.setItem('activePlantId', 'p1');
        const dispatchSpy = vi.spyOn(globalThis, 'dispatchEvent');

        service.setActivePlantId('p1');

        expect(dispatchSpy).not.toHaveBeenCalled();
        expect(globalThis.localStorage.getItem('activePlantId')).toBe('p1');
    });

    it('RF72-OBL getAllPlants sincronizza wardIds nel realtime cache con utente loggato', async () => {
        internalAuthStub.getCurrentUser$.mockReturnValueOnce(
            of({
                userId: 'u-1',
                username: 'admin',
                role: 0,
                accessToken: 'token',
                isFirstAccess: false,
            }),
        );

        const plantsPromise = firstValueFrom(service.getAllPlants());

        const request = httpMock.expectOne('http://localhost:3000/plant/all');
        request.flush([
            { id: 'p1', name: 'Plant 1', wardId: 10, rooms: [] },
            { id: 'p2', name: 'Plant 2', wardId: 20, rooms: [] },
            { id: 'p3', name: 'Plant 3', wardId: 20, rooms: [] },
        ]);

        await plantsPromise;

        expect(wardRealtimeCacheStub.mergeWardIds).toHaveBeenCalledWith('u-1', ['10', '20']);
    });
});
