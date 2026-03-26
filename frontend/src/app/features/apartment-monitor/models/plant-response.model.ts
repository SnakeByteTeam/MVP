export interface PlantDeviceDto {
	id: string;
	name: string;
	type?: string;
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
