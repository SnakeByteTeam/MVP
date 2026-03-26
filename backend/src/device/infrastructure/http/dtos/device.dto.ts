import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Device } from 'src/device/domain/models/device.model';
import { DatapointDto } from './datapoint.dto';

export class DeviceDto {
  @ApiProperty({ example: 'device-1' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Living Room Lamp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'plant-1' })
  @IsString()
  @IsNotEmpty()
  plantId: string;

  @ApiProperty({ example: 'SF_Light' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'SS_Light_Switch' })
  @IsString()
  @IsNotEmpty()
  subType: string;

  @ApiProperty({ type: () => DatapointDto, isArray: true })
  @IsArray()
  @IsNotEmpty()
  datapoints: DatapointDto[];

  static toDomain(dto: DeviceDto): Device {
    const datapoints = dto.datapoints.map((datapoint) =>
      DatapointDto.toDomain(datapoint),
    );
    return new Device(
      dto.id,
      dto.plantId,
      dto.name,
      dto.type,
      dto.subType,
      datapoints,
    );
  }

  static fromDomain(device: Device): DeviceDto {
    const dto = new DeviceDto();
    dto.id = device.getId();
    dto.plantId = device.getPlantId();
    dto.name = device.getName();
    dto.type = device.getType();
    dto.subType = device.getSubType();
    dto.datapoints = device
      .getDatapoints()
      .map((datapoint) => DatapointDto.fromDomain(datapoint));
    return dto;
  }
}
