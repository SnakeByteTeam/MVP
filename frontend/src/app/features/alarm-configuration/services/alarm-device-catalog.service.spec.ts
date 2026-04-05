import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceType } from '../../device-interaction/models/device-type.enum';
import { ApartmentApiService } from '../../apartment-monitor/services/apartment-api.service';
import { AlarmDeviceCatalogService } from './alarm-device-catalog.service';

describe('AlarmDeviceCatalogService', () => {
    let service: AlarmDeviceCatalogService;

    const apartmentApiStub = {
        getAllPlants: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        TestBed.configureTestingModule({
            providers: [
                AlarmDeviceCatalogService,
                { provide: ApartmentApiService, useValue: apartmentApiStub },
            ],
        });

        service = TestBed.inject(AlarmDeviceCatalogService);
    });

    it('ensureLoaded popola il catalog deviceId -> apartmentName', async () => {
        apartmentApiStub.getAllPlants.mockReturnValue(
            of([
                {
                    id: 'plant-1',
                    name: 'Appartamento 1',
                    rooms: [
                        {
                            id: 'room-1',
                            name: 'Soggiorno',
                            devices: [
                                {
                                    id: 'dev-1',
                                    name: 'Sensore Temperatura',
                                    datapoints: [
                                        { id: 'dp-dev-1-temp', name: 'Temperatura' },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 'plant-2',
                    name: 'Appartamento 2',
                    rooms: [
                        {
                            id: 'room-2',
                            name: 'Ingresso',
                            devices: [
                                { id: 'dev-2', name: 'Sensore Porta' },
                            ],
                        },
                    ],
                },
            ]),
        );

        await firstValueFrom(service.ensureLoaded());

        expect(apartmentApiStub.getAllPlants).toHaveBeenCalledTimes(1);
        expect(service.getApartmentNameByDeviceId('dev-1')).toBe('Appartamento 1');
        expect(service.getApartmentNameByDeviceId('dp-dev-1-temp')).toBe('Appartamento 1');
        expect(service.getApartmentNameByDeviceId('dev-2')).toBe('Appartamento 2');
        expect(service.loaded()).toBe(true);
    });

    it('registerApartment aggiorna il catalog anche senza preload globale', () => {
        service.registerApartment({
            id: 'plant-7',
            name: 'Appartamento 7',
            isEnabled: true,
            rooms: [
                {
                    id: 'room-7',
                    name: 'Camera',
                    hasActiveAlarm: false,
                    devices: [
                        {
                            id: 'dev-77',
                            name: 'Sensore Letto',
                            type: DeviceType.LIGHT,
                            status: 'ONLINE',
                            actions: [],
                        },
                    ],
                },
            ],
        });

        expect(service.getApartmentNameByDeviceId('dev-77')).toBe('Appartamento 7');
    });

    it('restituisce null per deviceId vuoto o non indicizzato', () => {
        expect(service.getApartmentNameByDeviceId('   ')).toBeNull();
        expect(service.getApartmentNameByDeviceId('unknown')).toBeNull();
    });

    it('ensureLoaded gestisce errori API senza propagare eccezioni', async () => {
        apartmentApiStub.getAllPlants.mockReturnValue(throwError(() => new Error('network')));

        await firstValueFrom(service.ensureLoaded());

        expect(service.loaded()).toBe(false);
        expect(service.getApartmentNameByDeviceId('dev-1')).toBeNull();
    });
});
