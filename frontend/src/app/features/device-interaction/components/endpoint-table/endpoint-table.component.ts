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
import { getDeviceTypeLabel, getEndpointLabel as resolveEndpointLabel } from '../../../../shared/models/device-taxonomy';

@Component({
	selector: 'app-endpoint-table',
	standalone: true,
	imports: [AsyncPipe],
	templateUrl: './endpoint-table.component.html',
	styleUrl: './endpoint-table.component.css',
})
export class EndpointTableComponent implements OnInit, OnDestroy {
	private readonly deviceApi = inject(DeviceApiService);
	private readonly refresh$ = new Subject<void>();
	private readonly selectedValuesByRow = new Map<string, string>();
	private readonly executingRows = new Set<string>();
	private readonly feedbackByRow = new Map<string, RowFeedback>();
	private readonly feedbackTimerByRow = new Map<string, ReturnType<typeof setTimeout>>();
	private activePlantChangeSubscription: Subscription | null = null;

	public readonly roomGroups$: Observable<EndpointRoomGroup[]> = this.refresh$.pipe(
		startWith(void 0),
		switchMap(() => this.deviceApi.getWritableEndpointRows().pipe(
			tap(() => {
				this.loadError = '';
			}),
			map((rows) => this.groupRowsByRoom(rows)),
		)),
		catchError(() => {
			this.loadError = 'Impossibile caricare i dispositivi con endpoint.';
			return of([]);
		}),
	);

	public loadError = '';

	public ngOnInit(): void {
		this.subscribeToActivePlantChanges();
	}

	public ngOnDestroy(): void {
		this.activePlantChangeSubscription?.unsubscribe();
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

	private resetTransientState(): void {
		this.selectedValuesByRow.clear();
		this.executingRows.clear();
		this.clearAllRowFeedback();
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