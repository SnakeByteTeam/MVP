import { CacheRepositoryImpl } from './cache-repository-impl';
import { FetchStructureCacheImpl } from './http/fetch-plant-structure-impl';
import { StructureCacheImpl } from './persistence/structure-cache-repository-impl';
import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';

describe('CacheRepositoryImpl', () => {
  let repository: CacheRepositoryImpl;
  let fetchStructureCache: jest.Mocked<Pick<FetchStructureCacheImpl, 'fetch' | 'getAllPlantIds'>>;
  let structureCache: jest.Mocked<Pick<StructureCacheImpl, 'write'>>;

  beforeEach(() => {
    fetchStructureCache = {
      fetch: jest.fn(),
      getAllPlantIds: jest.fn(),
    };

    structureCache = {
      write: jest.fn(),
    };

    repository = new CacheRepositoryImpl(
      fetchStructureCache as unknown as FetchStructureCacheImpl,
      structureCache as unknown as StructureCacheImpl,
    );
  });

  it('should delegate fetch to fetchStructureCache', async () => {
    const dto: PlantDto = {
      id: 'plant-1',
      name: 'Test Plant',
      rooms: [],
    };
    fetchStructureCache.fetch.mockResolvedValue(dto);

    const result = await repository.fetch('token-123', 'plant-1');

    expect(fetchStructureCache.fetch).toHaveBeenCalledWith('token-123', 'plant-1');
    expect(result).toEqual(dto);
  });

  it('should delegate getAllPlantIds to fetchStructureCache', async () => {
    fetchStructureCache.getAllPlantIds.mockResolvedValue(['plant-1', 'plant-2']);

    const result = await repository.getAllPlantIds('token-123');

    expect(fetchStructureCache.getAllPlantIds).toHaveBeenCalledWith('token-123');
    expect(result).toEqual(['plant-1', 'plant-2']);
  });

  it('should delegate write to structureCache', async () => {
    const plantEntity: PlantEntity = {
      id: 'plant-1',
      cached_at: new Date('2026-01-01T00:00:00.000Z'),
      ward_id: 1,
      data: {
        name: 'Test Plant',
        rooms: [],
      },
    };
    structureCache.write.mockResolvedValue(true);

    const result = await repository.write(plantEntity);

    expect(structureCache.write).toHaveBeenCalledWith(plantEntity);
    expect(result).toBe(true);
  });
});