import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { Room } from '../../../apartment-monitor/models/room.model';
import { DeviceCardComponent } from '../device-card/device-card.component';
import { DeviceApiService } from '../../services/device-api.service';

@Component({
	selector: 'app-room-detail',
	standalone: true,
	imports: [AsyncPipe, RouterLink, DeviceCardComponent],
	templateUrl: './room-detail.component.html',
	styleUrl: './room-detail.component.css'
})
export class RoomDetailComponent {
	private readonly route = inject(ActivatedRoute);
	private readonly deviceApi = inject(DeviceApiService);
	private readonly refresh$ = new Subject<void>();

	public readonly roomId$: Observable<string> = this.route.paramMap.pipe(
		map((params) => params.get('roomId') ?? 'living-room')
	);

	public readonly room$: Observable<Room> = this.roomId$.pipe(
		switchMap((roomId) =>
			this.refresh$.pipe(
				startWith(void 0),
				switchMap(() => this.deviceApi.getRoom(roomId))
			)
		),
		catchError(() => {
			this.error = 'Impossibile caricare i dispositivi della stanza.';
			return of({ id: '', name: '', hasActiveAlarm: false, devices: [] });
		})
	);

	public error = '';
}
