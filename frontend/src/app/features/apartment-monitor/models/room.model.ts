import { Device } from './device.model';

export interface Room {
	id: string;
	name: string;
	hasActiveAlarm: boolean;
	devices: Device[];
}
