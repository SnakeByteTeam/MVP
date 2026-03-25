import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { DeviceType } from '../../device-interaction/models/device-type.enum';
import { Apartment } from '../models/apartment.model';
import { DeviceStatus } from '../models/device.model';
import { PlantDto } from '../models/plant-response.model';

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
	private readonly plantEndpoint = `${this.baseUrl}/api/plant`;
	private readonly apartmentsEndpoint = `${this.baseUrl}/api/apartments`;

	public getCurrentApartment(): Observable<Apartment> {
		// TO_DO(back-end): sostituire con fonte ufficiale del plant attivo (claim JWT o endpoint dedicato).
		const plantId = this.getActivePlantId();

		return this.getApartmentByPlantId(plantId);
	}

	public getApartmentByPlantId(plantId: string): Observable<Apartment> {
		return this.http.get<PlantDto>(`${this.plantEndpoint}?plantid=${encodeURIComponent(plantId)}`).pipe(
			map((plant) => this.mapPlantToApartment(plant)),
		);
	}

	public enableApartment(apartmentId: string): Observable<void> {
		return this.http.patch<void>(
			`${this.apartmentsEndpoint}/${encodeURIComponent(apartmentId)}/enable`,
			{},
		);
	}

	public disableApartment(apartmentId: string): Observable<void> {
		return this.http.patch<void>(
			`${this.apartmentsEndpoint}/${encodeURIComponent(apartmentId)}/disable`,
			{},
		);
	}

	private getActivePlantId(): string {
		return localStorage.getItem('activePlantId') ?? 'plant-1';
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
