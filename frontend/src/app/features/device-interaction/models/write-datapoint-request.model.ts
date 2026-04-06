export interface WriteDatapointRequest {
	roomId: string;
	deviceId: string;
	datapointId: string;
	value: string;
}