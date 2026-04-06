import { DeviceType } from '../../device-interaction/models/device-type.enum';
import { DeviceAction } from './device-action.model';
import { Datapoint } from './datapoint.model';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'ALARM' | 'UNKNOWN';

export interface Device {
	id: string;
	name: string;
	type: DeviceType;
	status: DeviceStatus;
	actions: DeviceAction[];
	datapoints: Datapoint[];
}
