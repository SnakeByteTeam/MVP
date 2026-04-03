import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import {
  DeviceValue,
  DatapointValue,
} from 'src/device/domain/models/device-value.model';

export class DatapointValueDto {
  @ApiProperty({ example: 'dp-1' })
  @IsString()
  @IsNotEmpty()
  datapointId: string;

  @ApiProperty({ example: 'Power' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '42' })
  value: string | number;

  static fromDomain(domain: DatapointValue): DatapointValueDto {
    const dto = new DatapointValueDto();
    dto.datapointId = domain.getDatapointId();
    dto.name = domain.getName();
    dto.value = domain.getValue();
    return dto;
  }

  static toDomain(dto: DatapointValueDto): DatapointValue {
    return new DatapointValue(dto.datapointId, dto.name, dto.value);
  }
}

export class DeviceValueDto {
  @ApiProperty({ example: 'device-1' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ type: () => DatapointValueDto, isArray: true })
  @IsArray()
  @IsNotEmpty()
  values: DatapointValueDto[];

  static fromDomain(domain: DeviceValue): DeviceValueDto {
    const dto = new DeviceValueDto();
    dto.deviceId = domain.getDeviceId();
    dto.values = domain.getValues().map((v) => DatapointValueDto.fromDomain(v));
    return dto;
  }

  static toDomain(dto: DeviceValueDto): DeviceValue {
    const datapoints = dto.values.map((v) => DatapointValueDto.toDomain(v));
    return new DeviceValue(dto.deviceId, datapoints);
  }
}
