import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { Apartment } from '../../apartment-monitor/models/apartment.model';
import { PlantDto } from '../../apartment-monitor/models/plant-response.model';
import { ApartmentApiService } from '../../apartment-monitor/services/apartment-api.service';

type DeviceCatalogEntry = {
    apartmentName: string;
};

@Injectable({ providedIn: 'root' })
export class AlarmDeviceCatalogService {
    private readonly apartmentApi = inject(ApartmentApiService);

    private readonly deviceIndex = signal(new Map<string, DeviceCatalogEntry>());
    private readonly loadedSignal = signal(false);
    private readonly loadingSignal = signal(false);
    private readonly revisionSignal = signal(0);

    public readonly loaded = this.loadedSignal.asReadonly();
    public readonly loading = this.loadingSignal.asReadonly();
    public readonly revision = this.revisionSignal.asReadonly();

    public ensureLoaded(): Observable<void> {
        if (this.loadedSignal() || this.loadingSignal()) {
            return of(void 0);
        }

        this.loadingSignal.set(true);

        return this.apartmentApi.getAllPlants().pipe(
            tap((plants) => {
                this.rebuildFromPlants(plants);
                this.loadedSignal.set(true);
            }),
            map(() => void 0),
            catchError(() => {
                this.loadedSignal.set(false);
                return of(void 0);
            }),
            finalize(() => this.loadingSignal.set(false)),
        );
    }

    public registerApartment(apartment: Apartment): void {
        const apartmentName = apartment.name.trim();
        const normalizedApartmentName = apartmentName.length > 0 ? apartmentName : '-';
        const updatedIndex = new Map(this.deviceIndex());

        for (const room of apartment.rooms) {
            for (const device of room.devices) {
                const normalizedDeviceId = this.normalizeDeviceId(device.id);
                if (normalizedDeviceId.length === 0) {
                    continue;
                }

                updatedIndex.set(normalizedDeviceId, {
                    apartmentName: normalizedApartmentName,
                });
            }
        }

        this.deviceIndex.set(updatedIndex);
        this.bumpRevision();
    }

    public getApartmentNameByDeviceId(deviceId: string): string | null {
        const normalizedDeviceId = this.normalizeDeviceId(deviceId);
        if (normalizedDeviceId.length === 0) {
            return null;
        }

        return this.deviceIndex().get(normalizedDeviceId)?.apartmentName ?? null;
    }

    private rebuildFromPlants(plants: PlantDto[]): void {
        const rebuiltIndex = new Map<string, DeviceCatalogEntry>();

        for (const plant of plants) {
            const apartmentName = plant.name.trim();
            const normalizedApartmentName = apartmentName.length > 0 ? apartmentName : '-';

            for (const room of plant.rooms) {
                for (const device of room.devices) {
                    this.setDeviceIndexEntry(rebuiltIndex, device.id, normalizedApartmentName);

                    for (const datapoint of device.datapoints ?? []) {
                        this.setDeviceIndexEntry(rebuiltIndex, datapoint.id, normalizedApartmentName);
                    }
                }
            }
        }

        this.deviceIndex.set(rebuiltIndex);
        this.bumpRevision();
    }

    private bumpRevision(): void {
        this.revisionSignal.update((value) => value + 1);
    }

    private setDeviceIndexEntry(
        index: Map<string, DeviceCatalogEntry>,
        rawDeviceId: string,
        apartmentName: string,
    ): void {
        const normalizedDeviceId = this.normalizeDeviceId(rawDeviceId);
        if (normalizedDeviceId.length === 0) {
            return;
        }

        index.set(normalizedDeviceId, { apartmentName });
    }

    private normalizeDeviceId(rawDeviceId: string): string {
        return rawDeviceId.trim().toLowerCase();
    }
}
