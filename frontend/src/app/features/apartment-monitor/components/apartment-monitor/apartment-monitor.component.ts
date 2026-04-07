import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Observable, Subject, catchError, fromEvent, map, of, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { AlarmStateService } from '../../../../core/alarm/services/alarm-state.service';
import { AlarmMapComponent } from '../alarm-map/alarm-map.component';
import { EndpointTableComponent } from '../../../device-interaction/components/endpoint-table/endpoint-table.component';
import { Apartment } from '../../models/apartment.model';
import { ApartmentApiService, ApartmentOption } from '../../services/apartment-api.service';
import {
	ALARM_LIFECYCLE_UPDATED_EVENT,
	AlarmLifecycleUpdateDetail,
} from '../../../../core/alarm/models/realtime-alarm-event.model';

@Component({
	selector: 'app-apartment-monitor',
	standalone: true,
	imports: [AsyncPipe, AlarmMapComponent, EndpointTableComponent],
	templateUrl: './apartment-monitor.component.html',
	styleUrl: './apartment-monitor.component.css'
})
export class ApartmentMonitorComponent implements OnInit, OnDestroy {
	private readonly apartmentApi = inject(ApartmentApiService);
	private readonly alarmState = inject(AlarmStateService);
	private readonly refresh$ = new Subject<void>();
	private readonly destroy$ = new Subject<void>();

	public readonly activeAlarms$ = this.alarmState.getActiveAlarms$().pipe(map((alarms) => alarms ?? []));
	public readonly availableApartments$: Observable<ApartmentOption[]> = this.apartmentApi.getAvailableApartments().pipe(
		catchError(() => of([])),
	);
	public readonly apartment$: Observable<Apartment | null> = this.refresh$.pipe(
		startWith(void 0),
		switchMap(() => this.apartmentApi.getCurrentApartment()),
		tap((apartment) => {
			if (apartment) {
				this.activeApartmentId = apartment.id;
			}
		}),
		catchError(() => {
			this.error = 'Impossibile caricare i dati dell\'appartamento.';
			return of(null);
		})
	);

	public error = '';
	public activeApartmentId = '';

	public ngOnInit(): void {
		if (typeof globalThis.addEventListener !== 'function') {
			return;
		}

		fromEvent<CustomEvent<AlarmLifecycleUpdateDetail>>(
			globalThis,
			ALARM_LIFECYCLE_UPDATED_EVENT,
		)
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.error = '';
				this.refresh$.next();
			});
	}

	public ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	public onApartmentSelected(apartmentId: string): void {
		if (!apartmentId || apartmentId === this.activeApartmentId) {
			return;
		}

		this.apartmentApi.setActivePlantId(apartmentId);
		this.error = '';
		this.refresh$.next();
	}
}
