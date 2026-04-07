import { Injectable, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { WardPlantDto } from '../../ward-management/models/ward-api.dto';
import { WardApiService } from '../../ward-management/services/ward-api.service';
import { ApartmentApiService } from '../../apartment-monitor/services/apartment-api.service';
import { DeviceDatapointExtractionService, DeviceDatapointOption } from './device-datapoint-extraction.service';

@Injectable()
export class AlarmConfigFormStateService {
    private hasRequestedPlants = false;

    constructor(
        private readonly wardApi: WardApiService,
        private readonly apartmentApi: ApartmentApiService,
        private readonly datapointExtraction: DeviceDatapointExtractionService,
    ) { }

    public readonly plants = signal<WardPlantDto[]>([]);
    public readonly plantsLoadError = signal<string | null>(null);
    public readonly devicesLoadError = signal<string | null>(null);
    public readonly isDevicesLoading = signal(false);

    public ensurePlantsLoaded(mode: 'create' | 'edit'): Observable<void> {
        if (mode === 'edit' || this.plants().length > 0 || this.hasRequestedPlants) {
            return of(void 0);
        }

        this.hasRequestedPlants = true;

        return this.loadAllPlants().pipe(
            tap((plants) => {
                this.plantsLoadError.set(null);
                this.plants.set(plants);
            }),
            map(() => void 0),
            catchError(() => {
                this.plants.set([]);
                this.plantsLoadError.set('Errore durante il caricamento degli impianti disponibili.');
                return of(void 0);
            }),
        );
    }

    public resetDevicesLoadState(): void {
        this.devicesLoadError.set(null);
        this.isDevicesLoading.set(false);
    }

    public loadDeviceOptionsByPlant(plantId: string): Observable<DeviceDatapointOption[]> {
        const normalizedPlantId = plantId.trim();
        this.devicesLoadError.set(null);

        if (normalizedPlantId.length === 0) {
            this.isDevicesLoading.set(false);
            return of([]);
        }

        this.isDevicesLoading.set(true);

        return this.apartmentApi.getApartmentByPlantId(normalizedPlantId).pipe(
            map((apartment) => this.datapointExtraction.extractDeviceOptions(apartment)),
            tap(() => {
                this.isDevicesLoading.set(false);
            }),
            catchError(() => {
                this.devicesLoadError.set('Errore durante il caricamento dei dispositivi.');
                this.isDevicesLoading.set(false);
                return of([] as DeviceDatapointOption[]);
            }),
        );
    }

    private loadAllPlants(): Observable<WardPlantDto[]> {
        return forkJoin({
            availablePlants: this.wardApi.getAvailablePlants().pipe(catchError(() => of([] as WardPlantDto[]))),
            wards: this.wardApi.getWards().pipe(catchError(() => of([]))),
        }).pipe(
            switchMap(({ availablePlants, wards }) => {
                if (wards.length === 0) {
                    return of(this.mergePlants(availablePlants, []));
                }

                const wardPlantsRequests = wards.map((ward) =>
                    this.wardApi
                        .getPlantsByWardId(ward.id)
                        .pipe(catchError(() => of([] as WardPlantDto[]))),
                );

                return forkJoin(wardPlantsRequests).pipe(
                    map((assignedPlantsByWard) => this.mergePlants(availablePlants, assignedPlantsByWard.flat())),
                );
            }),
        );
    }

    private mergePlants(availablePlants: WardPlantDto[], assignedPlants: WardPlantDto[]): WardPlantDto[] {
        const mergedMap = new Map<string, WardPlantDto>();

        for (const plant of [...availablePlants, ...assignedPlants]) {
            mergedMap.set(plant.id, plant);
        }

        return Array.from(mergedMap.values()).sort((first, second) => first.name.localeCompare(second.name));
    }
}
