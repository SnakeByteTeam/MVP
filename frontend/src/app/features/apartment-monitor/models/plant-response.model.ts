export interface PlantDatapointDto {
	id: string;
	name: string;
	readable: boolean;
	writable: boolean;
	valueType: string;
	enum?: string[];
	sfeType: string;
}

export interface PlantDeviceDto {
	id: string;
	name: string;
	type?: string;
	subType?: string;
	datapoints?: PlantDatapointDto[];
}

export interface PlantRoomDto {
	id: string;
	name: string;
	devices: PlantDeviceDto[];
}

export interface PlantDto {
	id: string;
	name: string;
	wardId?: number;
	rooms: PlantRoomDto[];
}
