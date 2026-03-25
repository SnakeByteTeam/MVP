import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { Room } from "src/plant/domain/models/room.model";
import { DeviceDto } from "../../../../device/infrastructure/dtos/device.dto";

export class RoomDto {
	@IsString()
	@IsNotEmpty()
	id: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsArray()
	@IsNotEmpty()
	devices: DeviceDto[];

	static toDomain(dto: RoomDto): Room {
		const devices = dto.devices.map((device) => DeviceDto.toDomain(device));
		return new Room(dto.id, dto.name, devices);
	}

	static fromDomain(room: Room): RoomDto {
		const dto = new RoomDto();
		dto.id = room.getId();
		dto.name = room.getName();
		dto.devices = room.getDevices().map((device) => DeviceDto.fromDomain(device));
		return dto;
	}
}
