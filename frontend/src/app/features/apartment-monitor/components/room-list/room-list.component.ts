import { Component, input, output } from '@angular/core';
import { Room } from '../../models/room.model';

@Component({
	selector: 'app-room-list',
	standalone: true,
	templateUrl: './room-list.component.html',
	styleUrl: './room-list.component.css'
})
export class RoomListComponent {
	public readonly rooms = input<Room[]>([]);
	public readonly roomSelected = output<string>();

	public onRoomSelect(roomId: string): void {
		this.roomSelected.emit(roomId);
	}
}