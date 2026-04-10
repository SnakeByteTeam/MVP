import { Plant } from 'src/plant/domain/models/plant.model';
import { FindPlantByIdPort } from 'src/plant/application/ports/out/find-plant-by-id.port';
import { FindAllAvailablePlantsPort } from 'src/plant/application/ports/out/find-all-available-plants.port';
import { FindAllPlantsPort } from 'src/plant/application/ports/out/find-all-plants.port';
import { PlantService } from 'src/plant/application/services/plant.service';

describe('PlantService', () => {
  let service: PlantService;
  let findByIdPort: jest.Mocked<FindPlantByIdPort>;
  let findAllAvailablePlantsPort: jest.Mocked<FindAllAvailablePlantsPort>;
  let findAllPlantsPort: jest.Mocked<FindAllPlantsPort>;

  beforeEach(() => {
    findByIdPort = {
      findById: jest.fn(),
    };
    findAllAvailablePlantsPort = {
      findAllAvailablePlants: jest.fn(),
    };
    findAllPlantsPort = {
      findAllPlants: jest.fn(),
    };

    service = new PlantService(
      findByIdPort,
      findAllAvailablePlantsPort,
      findAllPlantsPort,
    );
  });

  it('should return plant from port', async () => {
    const plant = new Plant('plant-1', 'My Plant', [], 1);

    findByIdPort.findById.mockResolvedValue(plant);

    const result = await service.findById({ id: 'plant-1' });

    expect(result).toBe(plant);
    expect(findByIdPort.findById).toHaveBeenCalledWith({ id: 'plant-1' });
    expect(findByIdPort.findById).toHaveBeenCalledTimes(1);
  });

  it('should throw PlantId is null when command id is absent', async () => {
    await expect(service.findById({ id: '' })).rejects.toThrow(
      Error('PlantId is null'),
    );
  });

  it('should throw error when plant not found', async () => {
    findByIdPort.findById.mockResolvedValue(null);

    await expect(service.findById({ id: 'plant-1' })).rejects.toThrow(
      Error('Plant plant-1 not found'),
    );
  });

  describe('findAllAvailablePlants', () => {
    it('should return array of plants', async () => {
      const plant1 = new Plant('plant-1', 'Plant A', [], 1);
      const plant2 = new Plant('plant-2', 'Plant B', [], 2);

      findAllAvailablePlantsPort.findAllAvailablePlants.mockResolvedValue([
        plant1,
        plant2,
      ]);

      const result = await service.findAllAvailablePlants();

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(plant1);
      expect(result[1]).toBe(plant2);
      expect(
        findAllAvailablePlantsPort.findAllAvailablePlants,
      ).toHaveBeenCalledTimes(1);
    });

    it('should throw error when no available plants', async () => {
      findAllAvailablePlantsPort.findAllAvailablePlants.mockResolvedValue(null);

      await expect(service.findAllAvailablePlants()).rejects.toThrow(
        Error('No available plants found'),
      );
    });

    it('should return empty array when available plants returned', async () => {
      findAllAvailablePlantsPort.findAllAvailablePlants.mockResolvedValue([]);

      const result = await service.findAllAvailablePlants();

      expect(result).toEqual([]);
      expect(
        findAllAvailablePlantsPort.findAllAvailablePlants,
      ).toHaveBeenCalledTimes(1);
    });

    it('should propagate port errors', async () => {
      findAllAvailablePlantsPort.findAllAvailablePlants.mockRejectedValue(
        new Error('Port error'),
      );

      await expect(service.findAllAvailablePlants()).rejects.toThrow(
        'Port error',
      );
    });
  });

  describe('findAllPlants', () => {
    it('should return all plants', async () => {
      const plant1 = new Plant('plant-1', 'Plant A', [], 1);
      const plant2 = new Plant('plant-2', 'Plant B', [], 2);

      findAllPlantsPort.findAllPlants.mockResolvedValue([plant1, plant2]);

      const result = await service.findAllPlants();

      expect(result).toHaveLength(2);
      expect(findAllPlantsPort.findAllPlants).toHaveBeenCalledTimes(1);
    });

    it('should throw error when no plants are returned', async () => {
      findAllPlantsPort.findAllPlants.mockResolvedValue(null);

      await expect(service.findAllPlants()).rejects.toThrow(
        Error('No plants found'),
      );
    });

    it('should propagate port errors', async () => {
      findAllPlantsPort.findAllPlants.mockRejectedValue(
        new Error('Find all plants port error'),
      );

      await expect(service.findAllPlants()).rejects.toThrow(
        'Find all plants port error',
      );
    });
  });
});
