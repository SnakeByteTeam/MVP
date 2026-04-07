import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, timeout } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { Datapoint } from '../../apartment-monitor/models/datapoint.model';
import { PlantDatapointDto, PlantDto } from '../../apartment-monitor/models/plant-response.model';
import { Room } from '../../apartment-monitor/models/room.model';
import { WritableEndpointRow } from '../models/writable-endpoint-row.model';
import { resolveDeviceType } from '../../../shared/models/device-taxonomy';

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

	public getWritableEndpointRows(): Observable<WritableEndpointRow[]> {
		const plantId = this.getActivePlantId();

		return this.http.get<PlantDto>(`${this.plantEndpoint}?plantid=${encodeURIComponent(plantId)}`).pipe(
			catchError(() => of(this.getFallbackPlant(plantId))),
			map((plant) => this.mapWritableEndpointRows(plant)),
		);
	}

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
			timeout(9000),
			map((response) => {
				const statusCode = typeof response?.statusCode === 'number' ? response.statusCode : 202;
				const message = (response?.message ?? '').toLowerCase();

				const hasFailureCode = statusCode >= 400;
				const hasFailureMessage =
					message.includes('error') ||
					message.includes('failed') ||
					message.includes('fail') ||
					message.includes('impossibile');

				if (hasFailureCode || hasFailureMessage) {
					throw new Error(response?.message ?? 'Write datapoint failed');
				}

				return void 0;
			}),
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
			devices: sourceRoom.devices.map((device) => {
				const mappedDatapoints = this.mapDatapoints(device.datapoints);

				return {
					id: device.id,
					name: device.name,
					type: resolveDeviceType({
						rawType: device.type,
						rawSubType: device.subType,
						sfeTypes: mappedDatapoints.map((datapoint) => datapoint.sfeType),
					}),
					status: device.type ? 'ONLINE' : 'UNKNOWN',
					actions: [],
					datapoints: mappedDatapoints,
				};
			}),
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
			sfeType: datapoint.sfeType ?? '',
		}));
	}

	private mapWritableEndpointRows(plant: PlantDto): WritableEndpointRow[] {
		const rows: WritableEndpointRow[] = [];

		for (const room of plant.rooms) {
			for (const device of room.devices) {
				const mappedDatapoints = this.mapDatapoints(device.datapoints);
				const resolvedDeviceType = resolveDeviceType({
					rawType: device.type,
					rawSubType: device.subType,
					sfeTypes: mappedDatapoints.map((datapoint) => datapoint.sfeType),
				});

				const writableEnumDatapoints = mappedDatapoints.filter(
					(datapoint) => datapoint.writable && datapoint.enum.length > 0,
				);

				for (const datapoint of writableEnumDatapoints) {
					rows.push({
						roomId: room.id,
						roomName: room.name,
						deviceId: device.id,
						deviceName: device.name,
						deviceType: resolvedDeviceType,
						datapointId: datapoint.id,
						datapointName: datapoint.name,
						datapointSfeType: datapoint.sfeType,
						enumValues: datapoint.enum,
					});
				}
			}
		}

		return rows;
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
							subType: 'SS_Light_Switch',
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
							subType: 'SS_Blind',
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
