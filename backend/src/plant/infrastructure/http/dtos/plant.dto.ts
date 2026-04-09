import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plant } from 'src/plant/domain/models/plant.model';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { RoomDto } from './room.dto';

export class PlantDto {
  @ApiProperty({ example: 'plant-1' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ example: 'My Apartment' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ type: () => RoomDto, isArray: true })
  @IsArray()
  @IsOptional()
  rooms?: RoomDto[];

  @ApiPropertyOptional({ example: 1, type: Number })
  @IsNumber()
  @IsOptional()
  wardId?: number;

  static toDomain(dto: PlantDto): Plant {
    const rooms = (dto.rooms ?? []).map((room) => RoomDto.toDomain(room));
    return new Plant(dto.id, dto.name, rooms, dto.wardId);
  }

  static fromDomain(plant: Plant): PlantDto {
    const dto = new PlantDto();
    dto.id = plant.getId();
    dto.name = plant.getName();

    const rooms = plant.getRooms();
    dto.rooms = rooms ? rooms.map((room) => RoomDto.fromDomain(room)) : [];

    const wardId = plant.getWardId();
    if (wardId !== null) {
      dto.wardId = wardId;
    }

    return dto;
  }
}
