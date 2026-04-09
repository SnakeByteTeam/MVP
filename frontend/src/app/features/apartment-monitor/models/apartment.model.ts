import { Room } from './room.model';

export interface Apartment {
	id: string;
	name: string;
	isEnabled: boolean;
	rooms: Room[];
}
