import { Test, TestingModule } from '@nestjs/testing';
import { PlantAdapter } from 'src/plant/adapters/out/plant.adapter';
import {
  PLANT_REPOSITORY_PORT,
  type PlantRepositoryPort,
} from 'src/plant/application/repository/plant.repository';
import { FindPlantByIdCmd } from 'src/plant/application/commands/find-plant-by-id.command';
import { Plant } from 'src/plant/domain/models/plant.model';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';

describe('PlantAdapter', () => {
  let adapter: PlantAdapter;
  let repo: jest.Mocked<PlantRepositoryPort>;

  beforeEach(async () => {
    repo = {
      findById: jest.fn(),
      findAllAvailablePlants: jest.fn(),
      findAllPlants: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlantAdapter,
        { provide: PLANT_REPOSITORY_PORT, useValue: repo },
      ],
    }).compile();

    adapter = module.get<PlantAdapter>(PlantAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('findById', () => {
    it('should find plant by id and return mapped domain model', async () => {
      const cmd: FindPlantByIdCmd = { id: 'plant-123' };
      const mockEntity: PlantEntity = {
        id: 'plant-123',
        cached_at: new Date(),
        data: { name: 'Test Plant' },
      } as PlantEntity;

      jest.spyOn(PlantEntity, 'toDomain').mockReturnValue(
        new Plant('plant-123', 'Test Plant')
      );

      repo.findById.mockResolvedValue(mockEntity);

      const result = await adapter.findById(cmd);

      expect(result?.getId()).toBe('plant-123');
      expect(repo.findById).toHaveBeenCalledWith('plant-123');
    });

    it('should throw error when plantId is null', async () => {
      const cmd: FindPlantByIdCmd = { id: '' };

      await expect(adapter.findById(cmd)).rejects.toThrow('PlantId is null');
    });

    it('should throw error when plantId is missing', async () => {
      const cmd: FindPlantByIdCmd = {} as FindPlantByIdCmd;

      await expect(adapter.findById(cmd)).rejects.toThrow('PlantId is null');
    });

    it('should return null when repository returns null', async () => {
      const cmd: FindPlantByIdCmd = { id: 'plant-123' };
      repo.findById.mockResolvedValue(null);

      const result = await adapter.findById(cmd);

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      const cmd: FindPlantByIdCmd = { id: 'plant-123' };
      repo.findById.mockRejectedValue(new Error('Database error'));

      await expect(adapter.findById(cmd)).rejects.toThrow('Database error');
    });
  });

  describe('findAllAvailablePlants', () => {
    it('should find all available plants and return mapped domain models', async () => {
      const mockEntities: PlantEntity[] = [
        {
          id: 'plant-1',
          cached_at: new Date(),
          data: { name: 'Plant 1' },
        } as PlantEntity,
        {
          id: 'plant-2',
          cached_at: new Date(),
          data: { name: 'Plant 2' },
        } as PlantEntity,
      ];

      jest.spyOn(PlantEntity, 'toDomain').mockReturnValue({
        id: 'plant-1',
        name: 'Plant 1',
      } as unknown as Plant);

      repo.findAllAvailablePlants.mockResolvedValue(mockEntities);

      const result = await adapter.findAllAvailablePlants();

      expect(result).toHaveLength(2);
      expect(repo.findAllAvailablePlants).toHaveBeenCalledTimes(1);
    });

    it('should return null when repository returns null', async () => {
      repo.findAllAvailablePlants.mockResolvedValue(null);

      const result = await adapter.findAllAvailablePlants();

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      repo.findAllAvailablePlants.mockRejectedValue(new Error('DB error'));

      await expect(adapter.findAllAvailablePlants()).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('findAllPlants', () => {
    it('should find all plants and return mapped domain models', async () => {
      const mockEntities: PlantEntity[] = [
        {
          id: 'plant-1',
          cached_at: new Date(),
          data: { name: 'Plant 1' },
        } as PlantEntity,
        {
          id: 'plant-2',
          cached_at: new Date(),
          data: { name: 'Plant 2' },
        } as PlantEntity,
      ];

      jest.spyOn(PlantEntity, 'toDomain').mockReturnValue({
        id: 'plant-1',
        name: 'Plant 1',
      } as unknown as Plant);

      repo.findAllPlants.mockResolvedValue(mockEntities);

      const result = await adapter.findAllPlants();

      expect(result).toHaveLength(2);
      expect(repo.findAllPlants).toHaveBeenCalledTimes(1);
    });

    it('should return null when repository returns null', async () => {
      repo.findAllPlants.mockResolvedValue(null);

      const result = await adapter.findAllPlants();

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      repo.findAllPlants.mockRejectedValue(new Error('DB error'));

      await expect(adapter.findAllPlants()).rejects.toThrow('DB error');
    });
  });
});
