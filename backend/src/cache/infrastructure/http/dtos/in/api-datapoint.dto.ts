import { Expose, Type } from 'class-transformer';
import { ApiMetaDto } from './api-common.dto';

export class DatapointAttributesDto {
  @Expose() title: string;
  @Expose() readable: boolean;
  @Expose() writable: boolean;
  @Expose() value: string;
  @Expose() timestamp: string;
  @Expose() enum: string[];
  @Expose() valueType: string;
}

export class DatapointMetaDto {
  @Expose({ name: 'vimar:sfType' }) sfType: string;
  @Expose({ name: 'vimar:sfeType' }) sfeType: string;
}

export class ApiDatapointDto {
  @Expose() id: string;
  @Expose() type: string;

  @Expose()
  @Type(() => DatapointAttributesDto)
  attributes: DatapointAttributesDto;

  @Expose()
  @Type(() => DatapointMetaDto)
  meta: DatapointMetaDto;
}

export class DatapointResponseDto {
  @Expose()
  @Type(() => ApiMetaDto)
  meta: ApiMetaDto;

  @Expose()
  @Type(() => ApiDatapointDto)
  data: ApiDatapointDto[];
}
