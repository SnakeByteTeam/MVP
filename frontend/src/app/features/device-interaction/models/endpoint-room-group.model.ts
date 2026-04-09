import { WritableEndpointRow } from './writable-endpoint-row.model';

export interface EndpointRoomGroup {
	roomId: string;
	roomName: string;
	rows: WritableEndpointRow[];
}