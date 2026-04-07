import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap, take, tap } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { Apartment } from '../models/apartment.model';
import { DeviceStatus } from '../models/device.model';
import { PlantDto } from '../models/plant-response.model';
import { resolveDeviceType } from '../../../shared/models/device-taxonomy';
import { InternalAuthService } from '../../../core/services/internal-auth.service';
import { WardRealtimeCacheService } from '../../../core/alarm/services/ward-realtime-cache.service';

export interface ApartmentOption {
	id: string;
	name: string;
}

@Injectable({ providedIn: 'root' })
export class ApartmentApiService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl: string = inject(API_BASE_URL);
	private readonly authService = inject(InternalAuthService);
	private readonly wardRealtimeCache = inject(WardRealtimeCacheService);
	private readonly plantEndpoint = `${this.baseUrl}/plant`;
	private readonly apartmentsEndpoint = `${this.baseUrl}/apartments`;

	public getCurrentApartment(): Observable<Apartment> {
		return this.getAvailablePlants().pipe(
			map((plants) => {
				const storedPlantId = this.getActivePlantId();
				const selectedPlant = plants.find((plant) => plant.id === storedPlantId) ?? plants[0];

				if (!selectedPlant) {
					throw new Error('No available plants found');
				}

				this.setActivePlantId(selectedPlant.id);
				return selectedPlant.id;
			}),
			switchMap((plantId) => this.getApartmentByPlantId(plantId)),
		);
	}

	public getAvailableApartments(): Observable<ApartmentOption[]> {
		return this.getAvailablePlants().pipe(
			map((plants) =>
				plants
					.map((plant) => ({ id: plant.id, name: plant.name }))
					.sort((left, right) => left.name.localeCompare(right.name))
			),
		);
	}

	public getApartmentByPlantId(plantId: string): Observable<Apartment> {
		const query = `?plantid=${encodeURIComponent(plantId)}`;

		return this.http.get<PlantDto>(`${this.plantEndpoint}${query}`).pipe(
			map((plant) => this.mapPlantToApartment(plant)),
		);
	}

	public getAllPlants(): Observable<PlantDto[]> {
		return this.http.get<unknown>(`${this.plantEndpoint}/all`).pipe(
			map((response) => this.extractPlants(response)),
			tap((plants) => {
				this.cacheWardIdsForCurrentUser(plants);
			}),
		);
	}

	public enableApartment(apartmentId: string): Observable<void> {
		const encodedApartmentId = encodeURIComponent(apartmentId);

		return this.http.patch<void>(`${this.apartmentsEndpoint}/${encodedApartmentId}/enable`, {});
	}

	public disableApartment(apartmentId: string): Observable<void> {
		const encodedApartmentId = encodeURIComponent(apartmentId);

		return this.http.patch<void>(`${this.apartmentsEndpoint}/${encodedApartmentId}/disable`, {});
	}

	public setActivePlantId(plantId: string): void {
		const storage = globalThis.localStorage as {
			getItem?: (key: string) => string | null;
			setItem?: (key: string, value: string) => void;
		} | undefined;
		const previousPlantId =
			storage && typeof storage.getItem === 'function'
				? storage.getItem('activePlantId')
				: null;

		if (storage && typeof storage.setItem === 'function') {
			storage.setItem('activePlantId', plantId);
		}

		if (previousPlantId === plantId || typeof globalThis.dispatchEvent !== 'function') {
			return;
		}

		if (typeof CustomEvent === 'function') {
			globalThis.dispatchEvent(
				new CustomEvent('active-plant-changed', {
					detail: { plantId },
				}),
			);
			return;
		}

		globalThis.dispatchEvent(new Event('active-plant-changed'));
	}

	private getActivePlantId(): string | null {
		const storage = globalThis.localStorage as { getItem?: (key: string) => string | null } | undefined;

		if (storage && typeof storage.getItem === 'function') {
			return storage.getItem('activePlantId');
		}

		return null;
	}

	private getAvailablePlants(): Observable<PlantDto[]> {
		return this.getAllPlants();
	}

	private extractPlants(response: unknown): PlantDto[] {
		const directArray = this.asPlantArray(response);
		if (directArray.length > 0) {
			return directArray;
		}

		if (typeof response !== 'object' || response === null) {
			return [];
		}

		const wrappedResponse = response as { data?: unknown; plants?: unknown };
		const wrappedArray = this.asPlantArray(wrappedResponse.data ?? wrappedResponse.plants);
		return wrappedArray;
	}

	private asPlantArray(value: unknown): PlantDto[] {
		if (!Array.isArray(value)) {
			return [];
		}

		const uniqueById = new Map<string, PlantDto>();
		for (const candidate of value) {
			if (typeof candidate !== 'object' || candidate === null) {
				continue;
			}

			const plant = candidate as PlantDto;
			if (typeof plant.id !== 'string' || !plant.id.trim()) {
				continue;
			}

			const normalizedName = typeof plant.name === 'string' && plant.name.trim() ? plant.name : plant.id;
			uniqueById.set(plant.id, {
				...plant,
				name: normalizedName,
				rooms: Array.isArray(plant.rooms) ? plant.rooms : [],
			});
		}

		return Array.from(uniqueById.values());
	}

	private cacheWardIdsForCurrentUser(plants: ReadonlyArray<PlantDto>): void {
		const wardIds = Array.from(
			new Set(
				plants
					.map((plant) => plant.wardId)
					.filter((wardId): wardId is number => Number.isInteger(wardId))
					.map(String)
			)
		);

		if (wardIds.length === 0) {
			return;
		}

		this.authService
			.getCurrentUser$()
			.pipe(take(1))
			.subscribe((session) => {
				if (!session) {
					return;
				}

				this.wardRealtimeCache.mergeWardIds(session.userId, wardIds);
			});
	}

	private mapPlantToApartment(plant: PlantDto): Apartment {
		return {
			id: plant.id,
			name: plant.name,
			isEnabled: true,
			rooms: plant.rooms.map((room) => ({
				id: room.id,
				name: room.name,
				hasActiveAlarm: false,
				devices: room.devices.map((device) => ({
					type: resolveDeviceType({
						rawType: device.type,
						rawSubType: device.subType,
						rawName: device.name,
						sfeTypes: (device.datapoints ?? []).map((datapoint) => datapoint.sfeType),
					}),
					id: device.id,
					name: device.name,
					status: this.mapDeviceStatus(device.type),
					actions: [],
					datapoints: [],
				})),
			})),
		};
	}

	private mapDeviceStatus(rawType: string | undefined): DeviceStatus {
		return rawType ? 'ONLINE' : 'UNKNOWN';
	}
}
