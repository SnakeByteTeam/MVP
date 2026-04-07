import { DeviceType } from './device-type.enum';

export interface WritableEndpointRow {
	roomId: string;
	roomName: string;
	deviceId: string;
	deviceName: string;
	deviceType: DeviceType;
	datapointId: string;
	datapointName: string;
	datapointSfeType: string;
	enumValues: string[];
}