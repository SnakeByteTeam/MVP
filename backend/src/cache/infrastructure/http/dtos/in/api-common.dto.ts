import { Expose, Type } from 'class-transformer';

export class CollectionMetaDto {
  @Expose() offset: number;
  @Expose() items: number;
  @Expose() total: number;
}

export class ApiMetaDto {
  @Expose()
  @Type(() => CollectionMetaDto)
  collection: CollectionMetaDto;
}
