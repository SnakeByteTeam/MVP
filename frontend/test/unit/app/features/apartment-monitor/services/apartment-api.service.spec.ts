import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi, afterAll } from 'vitest';
import { InternalAuthService } from 'src/app/core/services/internal-auth.service';
import { WardRealtimeCacheService } from 'src/app/core/alarm/services/ward-realtime-cache.service';
import { API_BASE_URL } from 'src/app/core/tokens/api-base-url.token';
import { ApartmentApiService } from 'src/app/features/apartment-monitor/services/apartment-api.service';

describe('ApartmentApiService', () => {
    let service: ApartmentApiService;
    let httpMock: HttpTestingController;

    const internalAuthStub = {
        getCurrentUser$: vi.fn(() => of({ userId: 'user-1' })),
    };

    const wardRealtimeCacheStub = {
        mergeWardIds: vi.fn(),
    };

    const mockStorage: Record<string, string> = {};

    beforeEach(() => {
        // Mock localStorage
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => mockStorage[key] ?? null,
            setItem: (key: string, value: string) => { mockStorage[key] = value; }
        });
        
        // Mock dispatchEvent
        vi.stubGlobal('dispatchEvent', vi.fn());
        vi.stubGlobal('CustomEvent', class {
            detail: any;
            type: string;
            constructor(type: string, options: any) {
                this.type = type;
                this.detail = options?.detail;
            }
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
        
        // Clean storage
        for (const key of Object.keys(mockStorage)) {
            delete mockStorage[key];
        }
        vi.clearAllMocks();
    });

    afterEach(() => {
        httpMock.verify();
    });
    
    afterAll(() => {
        vi.unstubAllGlobals();
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

    describe('getAllPlants', () => {
        it('should fetch and extract direct array', async () => {
            const plantsRes = [{ id: '1', name: 'Plant 1' }, { id: '2', name: 'Plant 2' }];
            const promise = firstValueFrom(service.getAllPlants());
            
            const req = httpMock.expectOne('http://localhost:3000/plant/all');
            expect(req.request.method).toBe('GET');
            req.flush(plantsRes);
            
            const plants = await promise;
            expect(plants.length).toBe(2);
            expect(plants[0].id).toBe('1');
        });

        it('should handle wrapped array object', async () => {
            const plantsRes = { data: [{ id: '1', name: 'Plant 1', wardId: 2 }] };
            const promise = firstValueFrom(service.getAllPlants());
            
            const req = httpMock.expectOne('http://localhost:3000/plant/all');
            req.flush(plantsRes);
            
            const plants = await promise;
            expect(plants.length).toBe(1);
            expect(wardRealtimeCacheStub.mergeWardIds).toHaveBeenCalledWith('user-1', ['2']);
        });

        it('should handle un-normalized plants gracefully and map them', async () => {
            const plantsRes = [null, undefined, { }, {id: '  '}, {id: '1', name: '  '}];
            const promise = firstValueFrom(service.getAllPlants());
            
            const req = httpMock.expectOne('http://localhost:3000/plant/all');
            req.flush(plantsRes);
            
            const plants = await promise;
            expect(plants.length).toBe(1);
            expect(plants[0].name).toBe('1'); // fallback to id because name is empty
        });

        it('should return empty when response is invalid', async () => {
            const promise = firstValueFrom(service.getAllPlants());
            
            const req = httpMock.expectOne('http://localhost:3000/plant/all');
            req.flush(null); // Invalid body
            
            const plants = await promise;
            expect(plants.length).toBe(0);
        });
    });

    describe('getAvailableApartments', () => {
        it('should return mapped and sorted options', async () => {
            const plantsRes = [{ id: 'B', name: 'Z-Plant' }, { id: 'A', name: 'A-Plant' }];
            const promise = firstValueFrom(service.getAvailableApartments());
            
            httpMock.expectOne('http://localhost:3000/plant/all').flush(plantsRes);
            
            const options = await promise;
            expect(options.length).toBe(2);
            expect(options[0].name).toBe('A-Plant');
            expect(options[1].name).toBe('Z-Plant');
        });
    });

    describe('loadApartmentViewForPlantId', () => {
        it('should map a complex plant structure with devices', async () => {
            const complexPlant = {
                id: 'plant1',
                name: 'Main Plant',
                rooms: [
                    {
                        id: 'room1',
                        name: 'Kitchen',
                        devices: [
                            { type: 'RADARDETECTOR', subType: 'SF_ACCESS', name: 'Radar', id: 'd1', datapoints: [{id: 'dp1', sfeType: 'val'}] },
                            { type: 'SS_AUTOMATION_ONOFF', name: 'Switch', id: 'd2' },
                            { type: 'SS_ENERGY_MEASURE', name: 'Energy Meter', id: 'd3' } // this should be filtered out
                        ]
                    }
                ]
            };

            const promise = firstValueFrom(service.loadApartmentViewForPlantId('plant1'));
            
            httpMock.expectOne('http://localhost:3000/plant?plantid=plant1').flush(complexPlant);
            
            const apt = await promise;
            expect(apt.id).toBe('plant1');
            expect(apt.rooms.length).toBe(1);
            const devices = apt.rooms[0].devices;
            expect(devices.length).toBe(2); // Energy meter is excluded
            expect(devices[0].id).toBe('d1'); // Radar
            expect(devices[0].status).toBe('ONLINE');
        });

        it('should prioritize deduplication based on scores', async () => {
            const dedupPlant = {
                id: 'plant2',
                rooms: [
                    {
                        id: 'room2',
                        devices: [
                            { type: 'NORMAL', subType: 'NORMAL', name: 'RepeatedName', id: 'd1' },
                            { type: 'RADARDETECTOR', subType: 'SF_ACCESS', name: 'REPEATEDNAME', id: 'd2' } 
                        ]
                    }
                ]
            };

            const promise = firstValueFrom(service.loadApartmentViewForPlantId('plant2'));
            httpMock.expectOne('http://localhost:3000/plant?plantid=plant2').flush(dedupPlant);
            
            const apt = await promise;
            const devices = apt.rooms[0].devices;
            expect(devices.length).toBe(1); // Same normalized name "repeatedname"
            expect(devices[0].id).toBe('d2'); // Gets higher score (radar+access)
        });
    });

    describe('getCurrentApartment', () => {
        it('should use stored activePlantId if it exists', async () => {
            mockStorage['activePlantId'] = 'p2';
            
            const plants = [{id: 'p1'}, {id: 'p2'}];
            const promise = firstValueFrom(service.getCurrentApartment());
            
            httpMock.expectOne('http://localhost:3000/plant/all').flush(plants);
            httpMock.expectOne('http://localhost:3000/plant?plantid=p2').flush({id: 'p2', rooms: []});
            
            const apt = await promise;
            expect(apt.id).toBe('p2');
        });

        it('should use first plant if no activePlantId is stored', async () => {
            const plants = [{id: 'p1'}, {id: 'p2'}];
            const promise = firstValueFrom(service.getCurrentApartment());
            
            httpMock.expectOne('http://localhost:3000/plant/all').flush(plants);
            httpMock.expectOne('http://localhost:3000/plant?plantid=p1').flush({id: 'p1', rooms: []});
            
            const apt = await promise;
            expect(apt.id).toBe('p1');
        });

        it('should throw an error if no plants available', async () => {
            const promise = firstValueFrom(service.getCurrentApartment()).catch(e => e.message);
            
            httpMock.expectOne('http://localhost:3000/plant/all').flush([]);
            
            const err = await promise;
            expect(err).toBe('No available plants found');
        });
    });
    
    describe('setActivePlantId', () => {
        it('should set active plant in localStorage and dispatch event', () => {
            service.setActivePlantId('p42');
            expect(mockStorage['activePlantId']).toBe('p42');
            expect(globalThis.dispatchEvent).toHaveBeenCalled();
            // test idempotency
            service.setActivePlantId('p42');
            expect(globalThis.dispatchEvent).toHaveBeenCalledTimes(1); // shouldn't dispatch again
        });
    });
});
