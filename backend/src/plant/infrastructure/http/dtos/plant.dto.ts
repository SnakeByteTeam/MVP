import { Plant } from 'src/plant/domain/models/plant.model';
import { IsArray, IsDate, IsNotEmpty, IsString } from 'class-validator';
import { RoomDto } from './room.dto';

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

  @IsDate()
  @IsNotEmpty()
  cached_at: Date;

  static toDomain(dto: PlantDto): Plant {
    const rooms = dto.rooms.map((room) => RoomDto.toDomain(room));
    return new Plant(dto.id, dto.name, rooms, dto.cached_at);
  }

  static fromDomain(plant: Plant): PlantDto {
    const dto = new PlantDto();
    dto.id = plant.getId();
    dto.name = plant.getName();
    dto.rooms = plant.getRooms().map((room) => RoomDto.fromDomain(room));
    dto.cached_at = plant.getCachedAt();
    return dto;
  }
}
