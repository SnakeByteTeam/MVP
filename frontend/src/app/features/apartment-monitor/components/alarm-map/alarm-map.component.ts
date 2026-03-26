import { Component, computed, input } from '@angular/core';
import { ActiveAlarm } from '../../../../core/alarm/models/active-alarm.model';
import { Room } from '../../models/room.model';

@Component({
	selector: 'app-alarm-map',
	standalone: true,
	templateUrl: './alarm-map.component.html',
	styleUrl: './alarm-map.component.css'
})
export class AlarmMapComponent {
	public readonly rooms = input<Room[]>([]);
	public readonly activeAlarms = input<ActiveAlarm[]>([]);

	public readonly alarmedRoomsCount = computed(() => this.rooms().filter((room) => room.hasActiveAlarm).length);
}
