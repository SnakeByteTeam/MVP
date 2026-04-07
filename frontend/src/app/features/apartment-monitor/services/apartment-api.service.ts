import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { Apartment } from '../models/apartment.model';
import { DeviceStatus } from '../models/device.model';
import { PlantDto } from '../models/plant-response.model';
import { resolveDeviceType } from '../../../shared/models/device-taxonomy';

export interface ApartmentOption {
	id: string;
	name: string;
}

@Injectable({ providedIn: 'root' })
export class ApartmentApiService {
	private static readonly PLANT_FETCH_RETRY_DELAY_MS = 1500;
	private static readonly MAX_PLANT_FETCH_RETRIES = 8;

	private readonly http = inject(HttpClient);
	private readonly baseUrl: string = inject(API_BASE_URL);
	private readonly plantEndpoint = `${this.baseUrl}/plant`;
	private readonly legacyPlantEndpoint = `${this.baseUrl}/api/plant`;
	private readonly apartmentsEndpoint = `${this.baseUrl}/apartments`;
	private readonly legacyApartmentsEndpoint = `${this.baseUrl}/api/apartments`;

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
			map((plants) => plants.map((plant) => ({ id: plant.id, name: plant.name }))),
		);
	}

	public getApartmentByPlantId(plantId: string): Observable<Apartment> {
		const query = `?plantid=${encodeURIComponent(plantId)}`;

		return this.http
			.get<PlantDto>(`${this.plantEndpoint}${query}`)
			.pipe(
				catchError(() => this.http.get<PlantDto>(`${this.legacyPlantEndpoint}${query}`)),
				map((plant) => this.mapPlantToApartment(plant)),
			);
	}

	public getAllPlants(): Observable<PlantDto[]> {
		return this.http
			.get<PlantDto[] | { statusCode?: number; message?: string }>(`${this.plantEndpoint}/all`)
			.pipe(
				catchError(() =>
					this.http.get<PlantDto[] | { statusCode?: number; message?: string }>(`${this.legacyPlantEndpoint}/all`),
				),
				map((response) => (Array.isArray(response) ? response : [])),
			);
	}

	public enableApartment(apartmentId: string): Observable<void> {
		const encodedApartmentId = encodeURIComponent(apartmentId);

		return this.http
			.patch<void>(`${this.apartmentsEndpoint}/${encodedApartmentId}/enable`, {})
			.pipe(
				catchError(() =>
					this.http.patch<void>(`${this.legacyApartmentsEndpoint}/${encodedApartmentId}/enable`, {}),
				),
			);
	}

	public disableApartment(apartmentId: string): Observable<void> {
		const encodedApartmentId = encodeURIComponent(apartmentId);

		return this.http
			.patch<void>(`${this.apartmentsEndpoint}/${encodedApartmentId}/disable`, {})
			.pipe(
				catchError(() =>
					this.http.patch<void>(`${this.legacyApartmentsEndpoint}/${encodedApartmentId}/disable`, {}),
				),
			);
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
		return this.getAvailablePlantsWithRetry(0);
	}

	private getAvailablePlantsWithRetry(attempt: number): Observable<PlantDto[]> {
		return this.fetchAvailablePlantsOnce().pipe(
			switchMap((plants) => {
				if (plants.length > 0 || attempt >= ApartmentApiService.MAX_PLANT_FETCH_RETRIES) {
					return of(plants);
				}

				return timer(ApartmentApiService.PLANT_FETCH_RETRY_DELAY_MS).pipe(
					switchMap(() => this.getAvailablePlantsWithRetry(attempt + 1)),
				);
			}),
		);
	}

	private fetchAvailablePlantsOnce(): Observable<PlantDto[]> {
		return this.http
			.get<PlantDto[] | { statusCode?: number; message?: string }>(`${this.plantEndpoint}/available`)
			.pipe(
				catchError(() =>
					this.http.get<PlantDto[] | { statusCode?: number; message?: string }>(
						`${this.legacyPlantEndpoint}/available`,
					),
				),
				map((response) => (Array.isArray(response) ? response : [])),
				switchMap((plants) => (plants.length > 0 ? of(plants) : this.getAllPlants())),
			);
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
