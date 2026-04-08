export interface WriteDatapointRequest {
	roomId: string;
	deviceId: string;
	datapointId: string;
	value: string;
}

export interface WriteDatapointDto {
	datapointId: string;
	value: string;
}

export interface DeviceValuePointDto {
	datapointId: string;
	name: string;
	value: string | number;
}

export interface DeviceValueDto {
	deviceId: string;
	values: DeviceValuePointDto[];
}