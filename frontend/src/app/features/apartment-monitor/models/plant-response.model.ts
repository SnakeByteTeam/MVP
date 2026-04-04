export interface PlantDatapointDto {
	id: string;
	name: string;
}

export interface PlantDeviceDto {
	id: string;
	name: string;
	type?: string;
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
	rooms: PlantRoomDto[];
}
