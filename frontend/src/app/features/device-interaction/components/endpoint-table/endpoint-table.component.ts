import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
	EMPTY,
	Observable,
	Subject,
	Subscription,
	catchError,
	filter,
	finalize,
	fromEvent,
	interval,
	map,
	of,
	startWith,
	switchMap,
	tap,
} from 'rxjs';
import { DeviceType } from '../../models/device-type.enum';
import { EndpointRoomGroup } from '../../models/endpoint-room-group.model';
import { RowFeedback } from '../../models/row-feedback.model';
import { WritableEndpointRow } from '../../models/writable-endpoint-row.model';
import { DeviceApiService } from '../../services/device-api.service';
import type { DeviceValuePointDto } from '../../models/write-datapoint-request.model';
import { getDeviceTypeLabel, getEndpointLabel as resolveEndpointLabel } from '../../../../shared/models/device-taxonomy';

@Component({
	selector: 'app-endpoint-table',
	standalone: true,
	imports: [AsyncPipe],
	templateUrl: './endpoint-table.component.html',
	styleUrl: './endpoint-table.component.css',
})
export class EndpointTableComponent implements OnInit, OnDestroy {
	private static readonly CURRENT_VALUES_POLL_MS = 15000;

	private readonly deviceApi = inject(DeviceApiService);
	private readonly refresh$ = new Subject<void>();
	private readonly selectedValuesByRow = new Map<string, string>();
	private readonly executingRows = new Set<string>();
	private readonly feedbackByRow = new Map<string, RowFeedback>();
	private readonly feedbackTimerByRow = new Map<string, ReturnType<typeof setTimeout>>();
	private currentValuesByDevice = new Map<string, DeviceValuePointDto[]>();
	private latestRows: WritableEndpointRow[] = [];
	private activePlantChangeSubscription: Subscription | null = null;
	private currentValuesPollingSubscription: Subscription | null = null;

	public readonly roomGroups$: Observable<EndpointRoomGroup[]> = this.refresh$.pipe(
		startWith(void 0),
		switchMap(() => this.deviceApi.getWritableEndpointRows().pipe(
			tap(() => {
				this.loadError = '';
			}),
			tap((rows) => {
				this.latestRows = rows;
			}),
			switchMap((rows) =>
				this.loadCurrentValues(rows).pipe(map(() => this.groupRowsByRoom(rows))),
			),
		)),
		catchError(() => {
			this.loadError = 'Impossibile caricare i dispositivi con endpoint.';
			return of([]);
		}),
	);

	public loadError = '';

	public ngOnInit(): void {
		this.subscribeToActivePlantChanges();
		this.startCurrentValuesPolling();
	}

	public ngOnDestroy(): void {
		this.activePlantChangeSubscription?.unsubscribe();
		this.currentValuesPollingSubscription?.unsubscribe();
		this.clearAllRowFeedback();
	}

	public trackByGroup(_: number, group: EndpointRoomGroup): string {
		return group.roomId;
	}

	public trackByRow(_: number, row: WritableEndpointRow): string {
		return this.buildRowKey(row);
	}

	public getTypeLabel(type: DeviceType): string {
		return getDeviceTypeLabel(type);
	}

	public getEndpointLabel(row: WritableEndpointRow): string {
		return resolveEndpointLabel(row.datapointSfeType);
	}

	public getCurrentValue(row: WritableEndpointRow): string {
		const valuePoints = this.currentValuesByDevice.get(row.deviceId) ?? [];

		const exactMatch = valuePoints.find((point) => point.datapointId === row.datapointId);
		if (exactMatch?.value !== undefined && exactMatch?.value !== null) {
			return String(exactMatch.value);
		}

		const semanticCandidates = this.getSemanticCandidates(row);
		const semanticMatch = valuePoints.find((point) =>
			semanticCandidates.has(this.normalizeKey(point.name)),
		);
		if (semanticMatch?.value !== undefined && semanticMatch?.value !== null) {
			return String(semanticMatch.value);
		}

		const firstAvailable = valuePoints.find(
			(point) => point.value !== undefined && point.value !== null,
		);
		if (firstAvailable) {
			return String(firstAvailable.value);
		}

		return '-';
	}

	public getSelectedValue(row: WritableEndpointRow): string {
		const rowKey = this.buildRowKey(row);
		const currentValue = this.selectedValuesByRow.get(rowKey);

		if (currentValue) {
			return currentValue;
		}

		const fallbackValue = row.enumValues[0] ?? '';
		this.selectedValuesByRow.set(rowKey, fallbackValue);
		return fallbackValue;
	}

	public onSelectionChange(row: WritableEndpointRow, value: string): void {
		this.selectedValuesByRow.set(this.buildRowKey(row), value);
	}

	public isRowExecuting(row: WritableEndpointRow): boolean {
		return this.executingRows.has(this.buildRowKey(row));
	}

	public getRowFeedback(row: WritableEndpointRow): RowFeedback | null {
		return this.feedbackByRow.get(this.buildRowKey(row)) ?? null;
	}

	public onWriteRow(row: WritableEndpointRow): void {
		const rowKey = this.buildRowKey(row);

		if (this.executingRows.has(rowKey)) {
			return;
		}

		this.clearRowFeedback(rowKey);

		const selectedValue = this.getSelectedValue(row);
		if (!selectedValue) {
			return;
		}

		this.executingRows.add(rowKey);

		this.deviceApi.writeDatapointValue({ datapointId: row.datapointId, value: selectedValue }).pipe(
			tap(() => {
				this.setRowFeedback(rowKey, 'success', 'Comando inviato correttamente.');
				this.refresh$.next();
			}),
			catchError(() => {
				this.setRowFeedback(rowKey, 'error', 'Errore invio comando.');
				return EMPTY;
			}),
			finalize(() => {
				this.executingRows.delete(rowKey);
			}),
		).subscribe();
	}

	private groupRowsByRoom(rows: WritableEndpointRow[]): EndpointRoomGroup[] {
		const groupsById = new Map<string, EndpointRoomGroup>();

		for (const row of rows) {
			const existingGroup = groupsById.get(row.roomId);

			if (existingGroup) {
				existingGroup.rows.push(row);
				continue;
			}

			groupsById.set(row.roomId, {
				roomId: row.roomId,
				roomName: row.roomName,
				rows: [row],
			});
		}

		return Array.from(groupsById.values());
	}

	private buildRowKey(row: WritableEndpointRow): string {
		return `${row.roomId}::${row.deviceId}::${row.datapointId}`;
	}

	private clearRowFeedback(rowKey: string): void {
		this.feedbackByRow.delete(rowKey);

		const existingTimer = this.feedbackTimerByRow.get(rowKey);
		if (existingTimer) {
			clearTimeout(existingTimer);
			this.feedbackTimerByRow.delete(rowKey);
		}
	}

	private setRowFeedback(rowKey: string, type: RowFeedback['type'], message: string): void {
		this.clearRowFeedback(rowKey);
		this.feedbackByRow.set(rowKey, { type, message });

		const timer = setTimeout(() => {
			this.feedbackByRow.delete(rowKey);
			this.feedbackTimerByRow.delete(rowKey);
		}, 5000);

		this.feedbackTimerByRow.set(rowKey, timer);
	}

	private subscribeToActivePlantChanges(): void {
		if (typeof globalThis.addEventListener !== 'function') {
			return;
		}

		this.activePlantChangeSubscription = fromEvent<CustomEvent<{ plantId?: string }>>(
			globalThis,
			'active-plant-changed',
		).pipe(
			map((event) => event.detail?.plantId ?? ''),
			filter((plantId) => plantId.length > 0),
		).subscribe(() => {
			this.resetTransientState();
			this.refresh$.next();
		});
	}

	private startCurrentValuesPolling(): void {
		this.currentValuesPollingSubscription = interval(
			EndpointTableComponent.CURRENT_VALUES_POLL_MS,
		)
			.pipe(switchMap(() => this.loadCurrentValues(this.latestRows)))
			.subscribe();
	}

	private loadCurrentValues(rows: ReadonlyArray<WritableEndpointRow>): Observable<void> {
		const uniqueDeviceIds = Array.from(
			new Set(rows.map((row) => row.deviceId).filter((deviceId) => deviceId.trim().length > 0)),
		);

		if (uniqueDeviceIds.length === 0) {
			this.currentValuesByDevice.clear();
			return of(void 0);
		}

		return this.deviceApi.getCurrentValuePointsByDeviceIds(uniqueDeviceIds).pipe(
			tap((valuesByDevice) => {
				this.currentValuesByDevice = valuesByDevice;
			}),
			map(() => void 0),
			catchError(() => {
				this.currentValuesByDevice.clear();
				return of(void 0);
			}),
		);
	}

	private getSemanticCandidates(row: WritableEndpointRow): Set<string> {
		const cmdKey = this.normalizeKey(row.datapointSfeType || row.datapointName);
		const nameKey = this.normalizeKey(row.datapointName);
		const stateFromCmd = this.convertCmdToState(cmdKey);
		const stateFromName = this.convertCmdToState(nameKey);

		return new Set([cmdKey, nameKey, stateFromCmd, stateFromName].filter((key) => key.length > 0));
	}

	private convertCmdToState(value: string): string {
		return value.replaceAll('cmd', 'state');
	}

	private normalizeKey(value: string | undefined): string {
		if (!value) {
			return '';
		}

		let normalized = value.toLowerCase();
		for (const char of [' ', '_', '-', '.', '/', ':']) {
			normalized = normalized.replaceAll(char, '');
		}

		return normalized;
	}

	private resetTransientState(): void {
		this.selectedValuesByRow.clear();
		this.executingRows.clear();
		this.clearAllRowFeedback();
		this.currentValuesByDevice.clear();
		this.latestRows = [];
		this.loadError = '';
	}

	private clearAllRowFeedback(): void {
		for (const timer of this.feedbackTimerByRow.values()) {
			clearTimeout(timer);
		}

		this.feedbackTimerByRow.clear();
		this.feedbackByRow.clear();
	}
}