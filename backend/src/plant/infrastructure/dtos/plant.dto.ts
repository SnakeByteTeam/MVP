import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { RoomDto } from "./room.dto";

export class PlantDto {
	@IsString()
	@IsNotEmpty()
	id: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsArray()
	@IsNotEmpty()
	rooms: RoomDto[];
}
