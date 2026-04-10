import { Test, TestingModule } from '@nestjs/testing';
import { CacheAdapter } from './cache.adapter';
import {
  CACHE_REPOSITORY_PORT,
  type CacheRepositoryPort,
} from 'src/cache/application/repository/cache.repository';
import {
  GETVALIDTOKENPORT,
  type GetValidTokenPort,
} from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import { FetchNewCacheCmd } from 'src/cache/application/commands/fetch-new-cache.command';
import { Plant } from 'src/plant/domain/models/plant.model';
import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';

describe('CacheAdapter', () => {
  let adapter: CacheAdapter;
  let repo: jest.Mocked<CacheRepositoryPort>;
  let getValidTokenPort: jest.Mocked<GetValidTokenPort>;

  beforeEach(async () => {
    repo = {
      fetch: jest.fn(),
      getAllPlantIds: jest.fn(),
      write: jest.fn(),
    };

    getValidTokenPort = {
      getValidToken: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheAdapter,
        { provide: CACHE_REPOSITORY_PORT, useValue: repo },
        { provide: GETVALIDTOKENPORT, useValue: getValidTokenPort },
      ],
    }).compile();

    adapter = module.get<CacheAdapter>(CacheAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('fetch', () => {
    it('should fetch new cache data with valid token', async () => {
      const cmd: FetchNewCacheCmd = { plantId: 'plant-123' };
      const mockDto: PlantDto = {
        id: 'plant-123',
        name: 'Test Plant',
      } as PlantDto;

      const mockPlant = {
        getId: () => 'plant-123',
        getName: () => 'Test Plant',
        getRooms: () => null,
        getWardId: () => null,
      } as unknown as Plant;
      jest.spyOn(PlantDto, 'toDomain').mockReturnValue(mockPlant);

      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.fetch.mockResolvedValue(mockDto);

      const result = await adapter.fetch(cmd);

      expect(result).toMatchObject({ id: 'plant-123', name: 'Test Plant' });
      expect(getValidTokenPort.getValidToken).toHaveBeenCalledTimes(1);
      expect(repo.fetch).toHaveBeenCalledWith('valid-token', 'plant-123');
    });

    it('should throw error when plantId is null', async () => {
      const cmd: FetchNewCacheCmd = { plantId: '' };

      await expect(adapter.fetch(cmd)).rejects.toThrow('PlantId is null');
    });

    it('should throw error when plantId is missing', async () => {
      const cmd: FetchNewCacheCmd = {} as FetchNewCacheCmd;

      await expect(adapter.fetch(cmd)).rejects.toThrow('PlantId is null');
    });

    it('should throw error when no valid token found', async () => {
      const cmd: FetchNewCacheCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue(null);

      await expect(adapter.fetch(cmd)).rejects.toThrow('Valid token not found');
    });

    it('should throw error when plant is not found', async () => {
      const cmd: FetchNewCacheCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.fetch.mockResolvedValue(null);

      await expect(adapter.fetch(cmd)).rejects.toThrow('Plant not found');
    });

    it('should propagate repository errors', async () => {
      const cmd: FetchNewCacheCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.fetch.mockRejectedValue(new Error('API error'));

      await expect(adapter.fetch(cmd)).rejects.toThrow('API error');
    });
  });

  describe('getAllPlantIds', () => {
    it('should get all plant ids with valid token', async () => {
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.getAllPlantIds.mockResolvedValue(['plant-1', 'plant-2', 'plant-3']);

      const result = await adapter.getAllPlantIds();

      expect(result).toEqual(['plant-1', 'plant-2', 'plant-3']);
      expect(getValidTokenPort.getValidToken).toHaveBeenCalledTimes(1);
      expect(repo.getAllPlantIds).toHaveBeenCalledWith('valid-token');
    });

    it('should throw error when no valid token found', async () => {
      getValidTokenPort.getValidToken.mockResolvedValue(null);

      await expect(adapter.getAllPlantIds()).rejects.toThrow(
        'Failed to get valid token',
      );
    });

    it('should propagate repository errors', async () => {
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.getAllPlantIds.mockRejectedValue(new Error('API error'));

      await expect(adapter.getAllPlantIds()).rejects.toThrow('API error');
    });
  });

  describe('writeStructure', () => {
    it('should write cache structure successfully', async () => {
      const mockPlant = {
        getId: () => 'plant-123',
        getName: () => 'Test Plant',
        getRooms: () => null,
        getWardId: () => null,
      } as unknown as Plant;

      const mockEntity: PlantEntity = {
        id: 'plant-123',
        data: { name: 'Test Plant' },
      } as PlantEntity;

      jest.spyOn(PlantEntity, 'fromDomain').mockReturnValue(mockEntity);

      repo.write.mockResolvedValue(true);

      const result = await adapter.writeStructure(mockPlant);

      expect(result).toBe(true);
      expect(PlantEntity.fromDomain).toHaveBeenCalledWith(mockPlant);
      expect(repo.write).toHaveBeenCalledWith(mockEntity);
    });

    it('should return false when write fails', async () => {
      const mockPlant = {
        getId: () => 'plant-123',
        getName: () => 'Test Plant',
        getRooms: () => null,
        getWardId: () => null,
      } as unknown as Plant;

      const mockEntity: PlantEntity = {
        id: 'plant-123',
        data: { name: 'Test Plant' },
      } as PlantEntity;

      jest.spyOn(PlantEntity, 'fromDomain').mockReturnValue(mockEntity);
      repo.write.mockResolvedValue(false);

      const result = await adapter.writeStructure(mockPlant);

      expect(result).toBe(false);
    });

    it('should propagate repository errors', async () => {
      const mockPlant = {
        getId: () => 'plant-123',
        getName: () => 'Test Plant',
        getRooms: () => null,
        getWardId: () => null,
      } as unknown as Plant;

      const mockEntity: PlantEntity = {
        id: 'plant-123',
        data: { name: 'Test Plant' },
      } as PlantEntity;

      jest.spyOn(PlantEntity, 'fromDomain').mockReturnValue(mockEntity);
      repo.write.mockRejectedValue(new Error('DB error'));

      await expect(adapter.writeStructure(mockPlant)).rejects.toThrow(
        'DB error',
      );
    });
  });
});
