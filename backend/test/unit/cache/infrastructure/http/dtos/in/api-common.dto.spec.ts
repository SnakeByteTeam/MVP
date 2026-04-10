import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { ApiMetaDto, CollectionMetaDto } from 'src/cache/infrastructure/http/dtos/in/api-common.dto';

describe('ApiMetaDto', () => {
  it('should assign collection meta values', () => {
    const collection = new CollectionMetaDto();
    collection.offset = 10;
    collection.items = 20;
    collection.total = 30;

    const meta = new ApiMetaDto();
    meta.collection = collection;

    expect(meta.collection.offset).toBe(10);
    expect(meta.collection.items).toBe(20);
    expect(meta.collection.total).toBe(30);
  });

  it('should transform nested collection metadata from plain object', () => {
    const plain = {
      collection: {
        offset: 0,
        items: 5,
        total: 100,
      },
    };

    const meta = plainToInstance(ApiMetaDto, plain);

    expect(meta.collection).toBeInstanceOf(CollectionMetaDto);
    expect(meta.collection.total).toBe(100);
  });
});
