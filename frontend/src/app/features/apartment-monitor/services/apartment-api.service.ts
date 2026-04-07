import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap, take, tap, timer } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { Apartment } from '../models/apartment.model';
import { DeviceStatus } from '../models/device.model';
import { PlantDeviceDto, PlantDto } from '../models/plant-response.model';
import { resolveDeviceType } from '../../../shared/models/device-taxonomy';
import { InternalAuthService } from '../../../core/services/internal-auth.service';
import { WardRealtimeCacheService } from '../../../core/alarm/services/ward-realtime-cache.service';

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
	private readonly authService = inject(InternalAuthService);
	private readonly wardRealtimeCache = inject(WardRealtimeCacheService);
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
				tap((plants) => {
					this.cacheWardIdsForCurrentUser(plants);
				}),
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
				tap((plants) => {
					this.cacheWardIdsForCurrentUser(plants);
				}),
				switchMap((plants) => (plants.length > 0 ? of(plants) : this.getAllPlants())),
			);
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
<<<<<<< HEAD
			rooms: plant.rooms.map((room) => {
				const visibleDevices = this.deduplicateRoomDevices(
					room.devices.filter((device) => !this.isEnergyMeasureDevice(device.type, device.subType)),
				);

				return {
					id: room.id,
					name: room.name,
					hasActiveAlarm: false,
					devices: visibleDevices.map((device) => ({
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
				};
			}),
=======
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
					datapoints: (device.datapoints ?? []).map((datapoint) => ({
						id: datapoint.id,
						name: datapoint.name,
						readable: datapoint.readable,
						writable: datapoint.writable,
						valueType: datapoint.valueType,
						enum: datapoint.enum ?? [],
						sfeType: datapoint.sfeType,
					})),
				})),
			})),
>>>>>>> 6d72185 (refactor a datapoint id in AlarmRule)
		};
	}

	private deduplicateRoomDevices(devices: ReadonlyArray<PlantDeviceDto>): PlantDeviceDto[] {
		const byName = new Map<string, PlantDeviceDto>();

		for (const device of devices) {
			const key = this.normalizeDeviceName(device.name);
			const current = byName.get(key);

			if (!current || this.getDevicePriorityScore(device) > this.getDevicePriorityScore(current)) {
				byName.set(key, device);
			}
		}

		return Array.from(byName.values());
	}

	private normalizeDeviceName(name: string): string {
		return name.trim().toLowerCase();
	}

	private getDevicePriorityScore(device: PlantDeviceDto): number {
		const normalizedType = device.type?.toUpperCase() ?? '';
		const normalizedSubType = device.subType?.toUpperCase() ?? '';

		let score = 0;

		if (normalizedType.includes('RADARDETECTOR')) {
			score += 100;
		}

		if (normalizedSubType === 'SF_ACCESS') {
			score += 60;
		}

		if (normalizedType === 'SS_AUTOMATION_ONOFF') {
			score -= 20;
		}

		score += device.datapoints?.length ?? 0;
		return score;
	}

	private isEnergyMeasureDevice(
		rawType: string | undefined,
		rawSubType: string | undefined,
	): boolean {
		const normalizedType = rawType?.toUpperCase() ?? '';
		const normalizedSubType = rawSubType?.toUpperCase() ?? '';

		return (
			normalizedType.startsWith('SS_ENERGY_MEASURE') ||
			normalizedSubType === 'SF_ENERGY'
		);
	}

	private mapDeviceStatus(rawType: string | undefined): DeviceStatus {
		return rawType ? 'ONLINE' : 'UNKNOWN';
	}
}
