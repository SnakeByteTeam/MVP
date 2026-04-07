import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WardApiService } from '../../ward-management/services/ward-api.service';
import { ApartmentApiService } from '../../apartment-monitor/services/apartment-api.service';
import { DeviceDatapointExtractionService, DeviceDatapointOption } from './device-datapoint-extraction.service';
import { AlarmConfigFormStateService } from './alarm-config-form-state.service';

describe('AlarmConfigFormStateService', () => {
    let service: AlarmConfigFormStateService;

    const wardApiStub = {
        getAvailablePlants: vi.fn(),
        getWards: vi.fn(),
        getPlantsByWardId: vi.fn(),
    };

    const apartmentApiStub = {
        getApartmentByPlantId: vi.fn(),
    };

    const datapointExtractionStub = {
        extractDeviceOptions: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        wardApiStub.getAvailablePlants.mockReturnValue(of([]));
        wardApiStub.getWards.mockReturnValue(of([]));
        wardApiStub.getPlantsByWardId.mockReturnValue(of([]));
        apartmentApiStub.getApartmentByPlantId.mockReturnValue(of({ id: 'plant-1', rooms: [] }));
        datapointExtractionStub.extractDeviceOptions.mockReturnValue([]);

        TestBed.configureTestingModule({
            providers: [
                AlarmConfigFormStateService,
                { provide: WardApiService, useValue: wardApiStub },
                { provide: ApartmentApiService, useValue: apartmentApiStub },
                { provide: DeviceDatapointExtractionService, useValue: datapointExtractionStub },
            ],
        });

        service = TestBed.inject(AlarmConfigFormStateService);
    });

    it('ensurePlantsLoaded in create mode carica e deduplica gli impianti', async () => {
        wardApiStub.getAvailablePlants.mockReturnValueOnce(
            of([
                { id: 'plant-1', name: 'Appartamento 1' },
                { id: 'plant-2', name: 'Appartamento 2' },
            ]),
        );
        wardApiStub.getWards.mockReturnValueOnce(of([{ id: 10, name: 'Reparto A' }]));
        wardApiStub.getPlantsByWardId.mockReturnValueOnce(
            of([
                { id: 'plant-2', name: 'Appartamento 2' },
                { id: 'plant-3', name: 'Appartamento 3' },
            ]),
        );

        await firstValueFrom(service.ensurePlantsLoaded('create'));

        expect(service.plants().map((plant) => plant.id)).toEqual(['plant-1', 'plant-2', 'plant-3']);
        expect(service.plantsLoadError()).toBeNull();
    });

    it('ensurePlantsLoaded in edit mode non esegue chiamate', async () => {
        await firstValueFrom(service.ensurePlantsLoaded('edit'));

        expect(wardApiStub.getAvailablePlants).not.toHaveBeenCalled();
        expect(wardApiStub.getWards).not.toHaveBeenCalled();
    });

    it('loadDeviceOptionsByPlant ritorna opzioni dispositivi e pulisce loading state', async () => {
        const options: DeviceDatapointOption[] = [
            { id: 'device-1', label: 'Ingresso - Sensore', datapoints: [] },
        ];
        datapointExtractionStub.extractDeviceOptions.mockReturnValueOnce(options);

        const result = await firstValueFrom(service.loadDeviceOptionsByPlant('plant-1'));

        expect(apartmentApiStub.getApartmentByPlantId).toHaveBeenCalledWith('plant-1');
        expect(result).toEqual(options);
        expect(service.isDevicesLoading()).toBe(false);
        expect(service.devicesLoadError()).toBeNull();
    });

    it('loadDeviceOptionsByPlant in errore restituisce lista vuota e imposta messaggio', async () => {
        apartmentApiStub.getApartmentByPlantId.mockReturnValueOnce(throwError(() => new Error('network')));

        const result = await firstValueFrom(service.loadDeviceOptionsByPlant('plant-1'));

        expect(result).toEqual([]);
        expect(service.isDevicesLoading()).toBe(false);
        expect(service.devicesLoadError()).toBe('Errore durante il caricamento dei dispositivi.');
    });
});
