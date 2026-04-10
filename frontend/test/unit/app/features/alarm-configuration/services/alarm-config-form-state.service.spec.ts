import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WardApiService } from 'src/app/features/ward-management/services/ward-api.service';
import { ApartmentApiService } from 'src/app/features/apartment-monitor/services/apartment-api.service';
import { DeviceDatapointExtractionService, DeviceDatapointOption } from 'src/app/features/alarm-configuration/services/device-datapoint-extraction.service';
import { AlarmConfigFormStateService } from 'src/app/features/alarm-configuration/services/alarm-config-form-state.service';

describe('AlarmConfigFormStateService', () => {
    let service: AlarmConfigFormStateService;

    const wardApiStub = {
        getAvailablePlants: vi.fn(),
        getWards: vi.fn(),
        getPlantsByWardId: vi.fn(),
    };

    const apartmentApiStub = {
        loadApartmentViewForPlantId: vi.fn(),
        getAllPlants: vi.fn(),
    };

    const datapointExtractionStub = {
        extractDeviceOptions: vi.fn(),
        findDatapointByDeviceAndDatapointId: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        wardApiStub.getAvailablePlants.mockReturnValue(of([]));
        wardApiStub.getWards.mockReturnValue(of([]));
        wardApiStub.getPlantsByWardId.mockReturnValue(of([]));
        apartmentApiStub.loadApartmentViewForPlantId.mockReturnValue(of({ id: 'plant-1', rooms: [] }));
        apartmentApiStub.getAllPlants.mockReturnValue(of([]));
        datapointExtractionStub.extractDeviceOptions.mockReturnValue([]);
        datapointExtractionStub.findDatapointByDeviceAndDatapointId.mockReturnValue(null);

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

        expect(apartmentApiStub.loadApartmentViewForPlantId).toHaveBeenCalledWith('plant-1');
        expect(result).toEqual(options);
        expect(service.isDevicesLoading()).toBe(false);
        expect(service.devicesLoadError()).toBeNull();
    });

    it('loadDeviceOptionsByPlant in errore restituisce lista vuota e imposta messaggio', async () => {
        apartmentApiStub.loadApartmentViewForPlantId.mockReturnValueOnce(throwError(() => new Error('network')));

        const result = await firstValueFrom(service.loadDeviceOptionsByPlant('plant-1'));

        expect(result).toEqual([]);
        expect(service.isDevicesLoading()).toBe(false);
        expect(service.devicesLoadError()).toBe('Errore durante il caricamento dei dispositivi.');
    });

    it('resolveDatapointForEdit usa il catalogo piante e restituisce il datapoint trovato', async () => {
        const expectedDatapoint = {
            id: 'dp-1',
            name: 'SFE_State_OnOff',
            readable: true,
            writable: false,
            valueType: 'string',
            enum: ['Off', 'On'],
            sfeType: 'SFE_State_OnOff',
        };
        apartmentApiStub.getAllPlants.mockReturnValueOnce(of([{ id: 'plant-1', name: 'Apt', rooms: [] }]));
        datapointExtractionStub.findDatapointByDeviceAndDatapointId.mockReturnValueOnce(expectedDatapoint);

        const result = await firstValueFrom(service.resolveDatapointForEdit('device-1', 'dp-1'));

        expect(apartmentApiStub.getAllPlants).toHaveBeenCalledTimes(1);
        expect(datapointExtractionStub.findDatapointByDeviceAndDatapointId).toHaveBeenCalledWith(
            [{ id: 'plant-1', name: 'Apt', rooms: [] }],
            'device-1',
            'dp-1',
        );
        expect(result).toEqual(expectedDatapoint);
    });

    it('resolveDatapointForEdit ritorna null se il catalogo piante fallisce', async () => {
        apartmentApiStub.getAllPlants.mockReturnValueOnce(throwError(() => new Error('network')));

        const result = await firstValueFrom(service.resolveDatapointForEdit('device-1', 'dp-1'));

        expect(result).toBeNull();
    });
});
