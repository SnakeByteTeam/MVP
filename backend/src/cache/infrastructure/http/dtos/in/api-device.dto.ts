import { Expose, Type } from 'class-transformer';
import { ApiMetaDto } from './api-common.dto';

export class DeviceAttributesDto {
  @Expose() title: string;
}

export class DeviceMetaDto {
  @Expose({ name: 'vimar:ssType' }) ssType: string;
  @Expose({ name: 'vimar:sfType' }) sfType: string;
}

export class ApiDeviceDto {
  @Expose() id: string;
  @Expose() type: string;

  @Expose()
  @Type(() => DeviceAttributesDto)
  attributes: DeviceAttributesDto;

  @Expose()
  @Type(() => DeviceMetaDto)
  meta: DeviceMetaDto;
}

export class DeviceResponseDto {
  @Expose()
  @Type(() => ApiMetaDto)
  meta: ApiMetaDto;

  @Expose()
  @Type(() => ApiDeviceDto)
  data: ApiDeviceDto[];
}
