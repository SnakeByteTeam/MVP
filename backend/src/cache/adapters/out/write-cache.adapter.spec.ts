import { Test, TestingModule } from '@nestjs/testing';
import { WriteCacheAdapter } from './write-cache.adapter';
import {
  WriteCacheRepoPort,
  WRITE_CACHE_REPO_PORT,
} from 'src/cache/application/repository/write-cache.repository';
import { Plant } from 'src/plant/domain/models/plant.model';
import { Room } from 'src/plant/domain/models/room.model';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';

describe('WriteCacheAdapter', () => {
  let adapter: WriteCacheAdapter;
  let mockWriteCacheRepo: WriteCacheRepoPort;

  beforeEach(async () => {
    mockWriteCacheRepo = {
      write: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WriteCacheAdapter,
        {
          provide: WRITE_CACHE_REPO_PORT,
          useValue: mockWriteCacheRepo,
        },
      ],
    }).compile();

    adapter = module.get<WriteCacheAdapter>(WriteCacheAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('writeStructure', () => {
    it('should convert plant to entity and write to repository', async () => {
      const mockRoom = new Room('room-1', 'Living Room', []);
      const mockPlant = new Plant(
        'plant-1',
        'Test Plant',
        [mockRoom],
        1,
      );

      const mockPlantEntity: PlantEntity = {
        id: 'plant-1',
        cached_at: new Date(),
        ward_id: 1,
        data: {
          name: 'Test Plant',
          rooms: [
            {
              id: 'room-1',
              name: 'Living Room',
              devices: [],
            },
          ],
        },
      };

      jest
        .spyOn(PlantEntity, 'fromDomain')
        .mockReturnValueOnce(mockPlantEntity);
      jest.spyOn(mockWriteCacheRepo, 'write').mockResolvedValueOnce(true);

      const result = await adapter.writeStructure(mockPlant);

      expect(PlantEntity.fromDomain).toHaveBeenCalledWith(mockPlant);
      expect(mockWriteCacheRepo.write).toHaveBeenCalledWith(mockPlantEntity);
      expect(result).toBe(true);
    });

    it('should return false on write failure', async () => {
      const mockPlant = new Plant(
        'plant-1',
        'Test Plant',
        [],
        1,
      );

      const mockPlantEntity: PlantEntity = {
        id: 'plant-1',
        cached_at: new Date(),
        ward_id: 1,
        data: {
          name: 'Test Plant',
          rooms: [],
        },
      };

      jest
        .spyOn(PlantEntity, 'fromDomain')
        .mockReturnValueOnce(mockPlantEntity);
      jest.spyOn(mockWriteCacheRepo, 'write').mockResolvedValueOnce(false);

      const result = await adapter.writeStructure(mockPlant);

      expect(result).toBe(false);
    });

    it('should handle repository write errors', async () => {
      const mockPlant = new Plant(
        'plant-1',
        'Test Plant',
        [],
        1,
      );

      const mockPlantEntity: PlantEntity = {
        id: 'plant-1',
        cached_at: new Date(),
        ward_id: 1,
        data: {
          name: 'Test Plant',
          rooms: [],
        },
      };

      jest
        .spyOn(PlantEntity, 'fromDomain')
        .mockReturnValueOnce(mockPlantEntity);
      jest
        .spyOn(mockWriteCacheRepo, 'write')
        .mockRejectedValueOnce(new Error('Write failed'));

      await expect(adapter.writeStructure(mockPlant)).rejects.toThrow(
        'Write failed',
      );
    });

    it('should handle entity conversion errors', async () => {
      const mockPlant = new Plant(
        'plant-1',
        'Test Plant',
        [],
        1,
      );

      jest
        .spyOn(PlantEntity, 'fromDomain')
        .mockImplementationOnce(() => {
          throw new Error('Conversion failed');
        });

      await expect(adapter.writeStructure(mockPlant)).rejects.toThrow(
        'Conversion failed',
      );
    });
  });
});
