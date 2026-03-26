import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Datapoint } from 'src/device/domain/models/datapoint.model';

export class DatapointDto {
  @ApiProperty({ example: 'dp-1' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Power' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  readable: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  writable: boolean;

  @ApiProperty({ example: 'string' })
  @IsString()
  @IsNotEmpty()
  valueType: string;

  @ApiProperty({ example: ['Off', 'On'], isArray: true, type: String })
  @IsArray()
  @IsNotEmpty()
  enum: string[];

  @ApiProperty({ example: 'SFE_Cmd_OnOff' })
  @IsString()
  @IsNotEmpty()
  sfeType: string;

  static toDomain(dto: DatapointDto): Datapoint {
    const enumValues = Array.isArray(dto.enum) ? dto.enum : [];
    return new Datapoint(
      dto.id,
      dto.name,
      dto.readable,
      dto.writable,
      dto.valueType,
      enumValues,
      dto.sfeType,
    );
  }

  static fromDomain(datapoint: Datapoint): DatapointDto {
    const dto = new DatapointDto();
    dto.id = datapoint.getId();
    dto.name = datapoint.getName();
    dto.readable = datapoint.isReadable();
    dto.writable = datapoint.isWritable();
    dto.valueType = datapoint.getValueType();
    dto.enum = datapoint.getEnum();
    dto.sfeType = datapoint.getSfeType();
    return dto;
  }
}
