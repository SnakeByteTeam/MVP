import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { DeviceDto } from "../../../device/infrastructure/dtos/device.dto";

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
}
