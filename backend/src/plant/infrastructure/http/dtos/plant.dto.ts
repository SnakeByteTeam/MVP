import { ApiProperty } from '@nestjs/swagger';
import { Plant } from 'src/plant/domain/models/plant.model';
import { IsArray, IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { RoomDto } from './room.dto';

export class PlantDto {
  @ApiProperty({ example: 'plant-1' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'My Apartment' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: () => RoomDto, isArray: true })
  @IsArray()
  @IsNotEmpty()
  rooms: RoomDto[];

  @ApiProperty({ example: '2026-03-25T10:00:00.000Z', format: 'date-time' })
  @IsNumber()
  @IsNotEmpty()
  wardId: number;

  static toDomain(dto: PlantDto): Plant {
    const rooms = dto.rooms.map((room) => RoomDto.toDomain(room));
    return new Plant(dto.id, dto.name, rooms, dto.wardId);
  }

  static fromDomain(plant: Plant): PlantDto {
    const dto = new PlantDto();
    dto.id = plant.getId();
    dto.name = plant.getName();
    dto.rooms = plant.getRooms().map((room) => RoomDto.fromDomain(room));
    dto.wardId = plant.getWardId();
    return dto;
  }
}
