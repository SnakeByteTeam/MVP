import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Device } from 'src/device/domain/models/device.model';
import { DatapointDto } from './datapoint.dto';

export class DeviceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  plantId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  subType: string;

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
