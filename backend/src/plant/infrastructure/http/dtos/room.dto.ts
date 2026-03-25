import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Room } from 'src/plant/domain/models/room.model';
import { DeviceDto } from '../../../../device/infrastructure/dtos/device.dto';

export class RoomDto {
  @ApiProperty({ example: 'room-1' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Living Room' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: () => DeviceDto, isArray: true })
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
    dto.devices = room
      .getDevices()
      .map((device) => DeviceDto.fromDomain(device));
    return dto;
  }
}
