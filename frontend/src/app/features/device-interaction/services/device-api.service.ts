import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { Datapoint } from '../../apartment-monitor/models/datapoint.model';
import { PlantDatapointDto, PlantDto } from '../../apartment-monitor/models/plant-response.model';
import { Room } from '../../apartment-monitor/models/room.model';
import { DeviceType } from '../models/device-type.enum';

export interface WriteDatapointDto {
	datapointId: string;
	value: string;
}

@Injectable({ providedIn: 'root' })
export class DeviceApiService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl: string = inject(API_BASE_URL);
	private readonly plantEndpoint = `${this.baseUrl}/plant`;
	private readonly deviceEndpoint = `${this.baseUrl}/device`;

	public getRoom(roomId: string): Observable<Room> {
		// TO_DO(back-end): usare la sorgente ufficiale del plant attivo quando viene definita nel contratto.
		const plantId = this.getActivePlantId();

		return this.http.get<PlantDto>(`${this.plantEndpoint}?plantid=${encodeURIComponent(plantId)}`).pipe(
			catchError(() => of(this.getFallbackPlant(plantId))),
			map((plant) => this.mapRoomFromPlant(plant, roomId)),
		);
	}

	public writeDatapointValue(dto: WriteDatapointDto): Observable<void> {
		return this.http.post<{ message: string; statusCode: number }>(this.deviceEndpoint, dto).pipe(
			map(() => void 0),
		);
	}

	private getActivePlantId(): string {
		const storage = globalThis.localStorage as { getItem?: (key: string) => string | null } | undefined;

		if (storage && typeof storage.getItem === 'function') {
			return storage.getItem('activePlantId') ?? 'plant-1';
		}

		return 'plant-1';
	}

	private mapRoomFromPlant(plant: PlantDto, roomId: string): Room {
		const sourceRoom = plant.rooms.find((room) => room.id === roomId);

		if (!sourceRoom) {
			return this.getFallbackRoom(roomId);
		}

		return {
			id: sourceRoom.id,
			name: sourceRoom.name,
			hasActiveAlarm: false,
			devices: sourceRoom.devices.map((device) => ({
				id: device.id,
				name: device.name,
				type: this.mapDeviceType(device.type),
				status: device.type ? 'ONLINE' : 'UNKNOWN',
				actions: [],
				datapoints: this.mapDatapoints(device.datapoints),
			})),
		};
	}

	private mapDatapoints(datapoints: PlantDatapointDto[] | undefined): Datapoint[] {
		return (datapoints ?? []).map((datapoint) => ({
			id: datapoint.id,
			name: datapoint.name,
			readable: datapoint.readable,
			writable: datapoint.writable,
			valueType: datapoint.valueType,
			enum: Array.isArray(datapoint.enum) ? datapoint.enum : [],
			sfeType: datapoint.sfeType,
		}));
	}

	private mapDeviceType(rawType: string | undefined): DeviceType {
		const normalized = (rawType ?? '').toUpperCase();

		if (normalized.includes('THERMOSTAT')) {
			return DeviceType.THERMOSTAT;
		}

		if (normalized.includes('FALL')) {
			return DeviceType.FALL_SENSOR;
		}

		if (normalized.includes('PRESENCE')) {
			return DeviceType.PRESENCE_SENSOR;
		}

		if (normalized.includes('ALARM_BUTTON')) {
			return DeviceType.ALARM_BUTTON;
		}

		if (normalized.includes('DOOR')) {
			return DeviceType.ENTRANCE_DOOR;
		}

		if (normalized.includes('BLIND')) {
			return DeviceType.BLIND;
		}

		return DeviceType.LIGHT;
	}

	private getFallbackPlant(plantId: string): PlantDto {
		// TO_DO(back-end): eliminare il fallback quando i dati reali di /plant saranno sempre disponibili.
		return {
			id: plantId,
			name: 'Appartamento Demo',
			rooms: [
				{
					id: 'living-room',
					name: 'Soggiorno',
					devices: [
						{
							id: 'light-1',
							name: 'Luce',
							type: 'SF_Light',
							datapoints: [
								{
									id: 'dp-light-1',
									name: 'On/Off',
									readable: true,
									writable: true,
									valueType: 'string',
									enum: ['Off', 'On'],
									sfeType: 'SFE_Cmd_OnOff',
								},
							],
						},
						{
							id: 'blind-1',
							name: 'Tapparella',
							type: 'SF_Blind',
							datapoints: [
								{
									id: 'dp-blind-1',
									name: 'Movimento',
									readable: true,
									writable: true,
									valueType: 'string',
									enum: ['Up', 'Stop', 'Down'],
									sfeType: 'SFE_Cmd_Blind',
								},
							],
						},
					],
				},
				{
					id: 'bedroom',
					name: 'Camera',
					devices: [
						{
							id: 'sensor-1',
							name: 'Sensore Presenza',
							type: 'SF_Presence',
							datapoints: [],
						},
					],
				},
			],
		};
	}

	private getFallbackRoom(roomId: string): Room {
		const plant = this.getFallbackPlant('plant-1');
		return this.mapRoomFromPlant(plant, roomId === 'living-room' || roomId === 'bedroom' ? roomId : 'living-room');
	}
}
