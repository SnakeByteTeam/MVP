import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, catchError, map, of, startWith, switchMap, tap } from 'rxjs';
import { AlarmStateService } from '../../../../core/alarm/services/alarm-state.service';
import { AlarmMapComponent } from '../alarm-map/alarm-map.component';
import { RoomListComponent } from '../room-list/room-list.component';
import { Apartment } from '../../models/apartment.model';
import { ApartmentApiService, ApartmentOption } from '../../services/apartment-api.service';

@Component({
	selector: 'app-apartment-monitor',
	standalone: true,
	imports: [AsyncPipe, AlarmMapComponent, RoomListComponent],
	templateUrl: './apartment-monitor.component.html',
	styleUrl: './apartment-monitor.component.css'
})
export class ApartmentMonitorComponent {
	private readonly apartmentApi = inject(ApartmentApiService);
	private readonly alarmState = inject(AlarmStateService);
	private readonly router = inject(Router);
	private readonly refresh$ = new Subject<void>();

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

	public onRoomSelected(roomId: string): void {
		void this.router.navigate(['/device-interaction', roomId]);
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
