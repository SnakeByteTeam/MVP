import { Test, TestingModule } from '@nestjs/testing';
import { FetchNewCacheAdapter } from './fetch-cache.adapter';
import {
  FetchNewCacheRepoPort,
  FETCH_NEW_CACHE_REPO_PORT,
} from 'src/cache/application/repository/fetch-new-cache.repository';
import {
  GetValidTokenPort,
  GETVALIDTOKENPORT,
} from 'src/tokens/application/ports/out/get-valid-token.port';
import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';

describe('FetchNewCacheAdapter', () => {
  let adapter: FetchNewCacheAdapter;
  let mockGetValidTokenPort: GetValidTokenPort;
  let mockFetchNewCacheRepo: FetchNewCacheRepoPort;

  beforeEach(async () => {
    mockGetValidTokenPort = {
      getValidToken: jest.fn(),
    };

    mockFetchNewCacheRepo = {
      fetch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FetchNewCacheAdapter,
        {
          provide: GETVALIDTOKENPORT,
          useValue: mockGetValidTokenPort,
        },
        {
          provide: FETCH_NEW_CACHE_REPO_PORT,
          useValue: mockFetchNewCacheRepo,
        },
      ],
    }).compile();

    adapter = module.get<FetchNewCacheAdapter>(FetchNewCacheAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('fetch', () => {
    it('should fetch and convert plant from repository', async () => {
      const mockPlantDto: PlantDto = {
        id: 'plant-1',
        name: 'Test Plant',
        wardId: 1,
        rooms: [
          {
            id: 'room-1',
            name: 'Living Room',
            devices: [],
          },
        ],
      };

      jest
        .spyOn(mockGetValidTokenPort, 'getValidToken')
        .mockResolvedValueOnce('valid-token');
      jest
        .spyOn(mockFetchNewCacheRepo, 'fetch')
        .mockResolvedValueOnce(mockPlantDto);

      const plant = PlantDto.toDomain(mockPlantDto);
      jest
        .spyOn(PlantDto, 'toDomain')
        .mockReturnValueOnce(plant);

      const result = await adapter.fetch({ plantId: 'plant-1' });

      expect(mockGetValidTokenPort.getValidToken).toHaveBeenCalled();
      expect(mockFetchNewCacheRepo.fetch).toHaveBeenCalledWith(
        'valid-token',
        'plant-1',
      );
      expect(result.getId()).toBe('plant-1');
    });

    it('should throw error when plantId is null or undefined', async () => {
      const cmd: any = { plantId: null };
      
      await expect(adapter.fetch(cmd)).rejects.toThrow(
        'PlantId is null',
      );
    });

    it('should throw error when cmd is empty', async () => {
      const cmd: any = {};
      
      await expect(adapter.fetch(cmd)).rejects.toThrow(
        'PlantId is null',
      );
    });

    it('should throw error when valid token not found', async () => {
      jest
        .spyOn(mockGetValidTokenPort, 'getValidToken')
        .mockResolvedValueOnce(null);

      await expect(adapter.fetch({ plantId: 'plant-1' })).rejects.toThrow(
        'Valid token not found',
      );
    });

    it('should throw error when plant not found', async () => {
      jest
        .spyOn(mockGetValidTokenPort, 'getValidToken')
        .mockResolvedValueOnce('valid-token');
      jest
        .spyOn(mockFetchNewCacheRepo, 'fetch')
        .mockResolvedValueOnce(null);

      await expect(adapter.fetch({ plantId: 'plant-1' })).rejects.toThrow(
        'Plant not found',
      );
    });

    it('should handle repository fetch errors', async () => {
      jest
        .spyOn(mockGetValidTokenPort, 'getValidToken')
        .mockResolvedValueOnce('valid-token');
      jest
        .spyOn(mockFetchNewCacheRepo, 'fetch')
        .mockRejectedValueOnce(new Error('API error'));

      await expect(adapter.fetch({ plantId: 'plant-1' })).rejects.toThrow(
        'API error',
      );
    });

    it('should handle token fetch errors', async () => {
      jest
        .spyOn(mockGetValidTokenPort, 'getValidToken')
        .mockRejectedValueOnce(new Error('Token error'));

      await expect(adapter.fetch({ plantId: 'plant-1' })).rejects.toThrow(
        'Token error',
      );
    });
  });
});
