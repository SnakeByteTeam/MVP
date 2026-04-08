import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap, throwError, timeout } from 'rxjs';
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
		return this.resolveActivePlantId().pipe(
			switchMap((plantId) => this.fetchPlantById(plantId)),
			map((plant) => this.mapWritableEndpointRows(plant)),
		);
	}

	public getRoom(roomId: string): Observable<Room> {
		return this.resolveActivePlantId().pipe(
			switchMap((plantId) => this.fetchPlantById(plantId)),
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

	private resolveActivePlantId(): Observable<string> {
		const activePlantId = this.getActivePlantId();
		if (activePlantId) {
			return of(activePlantId);
		}

		return this.fetchAllPlants().pipe(
			map((plants) => plants[0]?.id ?? null),
			switchMap((plantId) => {
				if (!plantId) {
					return throwError(() => new Error('No plants available'));
				}

				this.setActivePlantId(plantId);
				return of(plantId);
			}),
		);
	}

	private fetchPlantById(plantId: string): Observable<PlantDto> {
		return this.http.get<PlantDto>(`${this.plantEndpoint}?plantid=${encodeURIComponent(plantId)}`);
	}

	private fetchAllPlants(): Observable<PlantDto[]> {
		return this.http
			.get<PlantDto[] | { statusCode?: number; message?: string }>(`${this.plantEndpoint}/all`)
			.pipe(
				map((response) => (Array.isArray(response) ? response : [])),
				catchError(() => of([])),
			);
	}

	private getActivePlantId(): string | null {
		const storage = globalThis.localStorage as { getItem?: (key: string) => string | null } | undefined;

		if (storage && typeof storage.getItem === 'function') {
			const plantId = storage.getItem('activePlantId');
			return plantId && plantId.trim() ? plantId : null;
		}

		return null;
	}

	private setActivePlantId(plantId: string): void {
		const storage = globalThis.localStorage as { setItem?: (key: string, value: string) => void } | undefined;
		if (!storage || typeof storage.setItem !== 'function') {
			return;
		}

		storage.setItem('activePlantId', plantId);
	}

	private mapRoomFromPlant(plant: PlantDto, roomId: string): Room {
		const sourceRoom = plant.rooms.find((room) => room.id === roomId);

		if (!sourceRoom) {
			throw new Error(`Room ${roomId} not found in plant ${plant.id}`);
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
						rawName: device.name,
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
					rawName: device.name,
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

}
