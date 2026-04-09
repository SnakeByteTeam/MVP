import { Expose, Type } from 'class-transformer';
import { ApiMetaDto } from './api-common.dto';
import { ApiPlantAttributesDto } from './api-plant-attributes.dto';

export class ApiPlantMetaDto {
  @Expose({ name: '@type' }) type: string[];
}

export class ApiRoomDto {
  @Expose() id: string;
  @Expose() type: string;

  @Expose()
  @Type(() => ApiPlantAttributesDto)
  attributes: ApiPlantAttributesDto;

  @Expose()
  @Type(() => ApiPlantMetaDto)
  meta: ApiPlantMetaDto;
}

export class ApiPlantResponseDto {
  @Expose()
  @Type(() => ApiMetaDto)
  meta: ApiMetaDto;

  @Expose()
  @Type(() => ApiRoomDto)
  data: ApiRoomDto[];
}
