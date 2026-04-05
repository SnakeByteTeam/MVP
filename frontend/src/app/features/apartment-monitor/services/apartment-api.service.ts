import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, switchMap } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { DeviceType } from '../../device-interaction/models/device-type.enum';
import { Apartment } from '../models/apartment.model';
import { DeviceStatus } from '../models/device.model';
import { PlantDto } from '../models/plant-response.model';

export interface ApartmentOption {
	id: string;
	name: string;
}

const DEVICE_TYPE_RULES: ReadonlyArray<{ token: string; type: DeviceType }> = [
	{ token: 'THERMOSTAT', type: DeviceType.THERMOSTAT },
	{ token: 'FALL', type: DeviceType.FALL_SENSOR },
	{ token: 'PRESENCE', type: DeviceType.PRESENCE_SENSOR },
	{ token: 'ALARM_BUTTON', type: DeviceType.ALARM_BUTTON },
	{ token: 'DOOR', type: DeviceType.ENTRANCE_DOOR },
	{ token: 'BLIND', type: DeviceType.BLIND },
];

@Injectable({ providedIn: 'root' })
export class ApartmentApiService {
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
		return this.http.get<PlantDto[]>(`${this.plantEndpoint}/available`);
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
					id: device.id,
					name: device.name,
					type: this.mapDeviceType(device.type),
					status: this.mapDeviceStatus(device.type),
					actions: [],
					datapoints: [],
				})),
			})),
		};
	}

	private mapDeviceType(rawType: string | undefined): DeviceType {
		// TO_DO(back-end): allineare questa mappatura appena viene confermato l'elenco ufficiale dei type/subType.
		const normalized = (rawType ?? '').toUpperCase();
		const matchingRule = DEVICE_TYPE_RULES.find((rule) => normalized.includes(rule.token));

		return matchingRule?.type ?? DeviceType.LIGHT;
	}

	private mapDeviceStatus(rawType: string | undefined): DeviceStatus {
		return rawType ? 'ONLINE' : 'UNKNOWN';
	}
}
