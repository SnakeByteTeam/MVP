import { PlantController } from 'src/plant/adapters/in/plant.controller';
import { FindPlantByIdUseCase } from 'src/plant/application/ports/in/find-plant-by-id.usecase';
import { FindAllAvailablePlantsUseCase } from 'src/plant/application/ports/in/find-all-available-plants.usecase';
import { FindAllPlantsUseCase } from 'src/plant/application/ports/in/find-all-plants.usecase';
import { Plant } from 'src/plant/domain/models/plant.model';

describe('PlantController', () => {
  let controller: PlantController;
  let findPlantByIdUseCase: jest.Mocked<FindPlantByIdUseCase>;
  let findAllAvailablePlantsUseCase: jest.Mocked<FindAllAvailablePlantsUseCase>;
  let findAllPlantsUseCase: jest.Mocked<FindAllPlantsUseCase>;

  beforeEach(() => {
    findPlantByIdUseCase = {
      findById: jest.fn(),
    };
    findAllAvailablePlantsUseCase = {
      findAllAvailablePlants: jest.fn(),
    };
    findAllPlantsUseCase = {
      findAllPlants: jest.fn(),
    };

    controller = new PlantController(
      findPlantByIdUseCase,
      findAllAvailablePlantsUseCase,
      findAllPlantsUseCase,
    );
  });

  it('should return PlantDto mapped from domain model', async () => {
    const cachedAt = new Date('2026-03-24T12:00:00.000Z');
    const plant = new Plant('plant-1', 'My Plant', [], 1);

    findPlantByIdUseCase.findById.mockResolvedValue(plant);

    const dto = await controller.findById('plant-1');

    expect(findPlantByIdUseCase.findById).toHaveBeenCalledWith({
      id: 'plant-1',
    });
    expect(findPlantByIdUseCase.findById).toHaveBeenCalledTimes(1);
    expect(dto.id).toBe('plant-1');
    expect(dto.name).toBe('My Plant');
    expect(dto.wardId).toBe(1);
    expect(dto.rooms).toEqual([]);
  });

  describe('getAllAvailablePlants', () => {
    it('should return array of available plants as DTOs', async () => {
      const plant1 = new Plant('plant-1', 'Plant A', [], 1);
      const plant2 = new Plant('plant-2', 'Plant B', [], 2);

      findAllAvailablePlantsUseCase.findAllAvailablePlants.mockResolvedValue([
        plant1,
        plant2,
      ]);

      const result = await controller.getAllAvailablePlants();

      expect(
        findAllAvailablePlantsUseCase.findAllAvailablePlants,
      ).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'plant-1',
        name: 'Plant A',
        rooms: [],
        wardId: 1,
      });
      expect(result[1]).toEqual({
        id: 'plant-2',
        name: 'Plant B',
        rooms: [],
        wardId: 2,
      });
    });

    it('should return error message when no plants found', async () => {
      findAllAvailablePlantsUseCase.findAllAvailablePlants.mockRejectedValue(
        new Error('No available plants'),
      );

      const result = await controller.getAllAvailablePlants();

      expect(result).toEqual({
        message: 'No available plants found',
        statusCode: 202,
      });
    });

    it('should handle empty plants array', async () => {
      findAllAvailablePlantsUseCase.findAllAvailablePlants.mockResolvedValue(
        [],
      );

      const result = await controller.getAllAvailablePlants();

      expect(result).toEqual([]);
    });

    it('should map multiple plants correctly', async () => {
      const plant1 = new Plant('plant-1', 'Growing Plant', [], 5);
      const plant2 = new Plant('plant-2', 'Thriving Plant', [], 10);
      const plant3 = new Plant('plant-3', 'New Plant', [], 0);

      findAllAvailablePlantsUseCase.findAllAvailablePlants.mockResolvedValue([
        plant1,
        plant2,
        plant3,
      ]);

      const result = await controller.getAllAvailablePlants();

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('plant-1');
      expect(result[0].wardId).toBe(5);
      expect(result[2].wardId).toBeUndefined();
    });
  });

  describe('getAllPlants', () => {
    it('should return all plants as DTOs', async () => {
      const plant1 = new Plant('plant-1', 'Plant A', [], 1);
      const plant2 = new Plant('plant-2', 'Plant B', [], 2);

      findAllPlantsUseCase.findAllPlants.mockResolvedValue([plant1, plant2]);

      const result = await controller.getAllPlants();

      expect(findAllPlantsUseCase.findAllPlants).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'plant-1',
        name: 'Plant A',
        rooms: [],
        wardId: 1,
      });
      expect(result[1]).toEqual({
        id: 'plant-2',
        name: 'Plant B',
        rooms: [],
        wardId: 2,
      });
    });

    it('should return fallback response when no plants are found', async () => {
      findAllPlantsUseCase.findAllPlants.mockRejectedValue(
        new Error('No plants found'),
      );

      const result = await controller.getAllPlants();

      expect(result).toEqual({
        message: 'No plants found',
        statusCode: 202,
      });
    });
  });
});
