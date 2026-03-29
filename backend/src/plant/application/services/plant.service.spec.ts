import { Plant } from 'src/plant/domain/models/plant.model';
import { FindPlantByIdPort } from '../ports/out/find-plant-by-id.port';
import { FindAllAvailablePlantsPort } from '../ports/out/find-all-available-plants.port';
import { PlantService } from './plant.service';

describe('PlantService', () => {
  let service: PlantService;
  let findByIdPort: jest.Mocked<FindPlantByIdPort>;
  let findAllAvailablePlantsPort: jest.Mocked<FindAllAvailablePlantsPort>;

  beforeEach(() => {
    findByIdPort = {
      findById: jest.fn(),
    };
    findAllAvailablePlantsPort = {
      findAllAvailablePlants: jest.fn(),
    };

    service = new PlantService(findByIdPort, findAllAvailablePlantsPort);
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
      expect(findAllAvailablePlantsPort.findAllAvailablePlants).toHaveBeenCalledTimes(1);
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
      expect(findAllAvailablePlantsPort.findAllAvailablePlants).toHaveBeenCalledTimes(1);
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
});
