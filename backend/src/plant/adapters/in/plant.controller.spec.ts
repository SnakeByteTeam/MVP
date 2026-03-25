import { PlantController } from './plant.controller';
import { FindPlantByIdUseCase } from 'src/plant/application/ports/in/find-plant-by-id.usecase';
import { Plant } from 'src/plant/domain/models/plant.model';

describe('PlantController', () => {
  let controller: PlantController;
  let findPlantByIdUseCase: jest.Mocked<FindPlantByIdUseCase>;

  beforeEach(() => {
    findPlantByIdUseCase = {
      findById: jest.fn(),
    };

    controller = new PlantController(findPlantByIdUseCase);
  });

  it('should return PlantDto mapped from domain model', async () => {
    const cachedAt = new Date('2026-03-24T12:00:00.000Z');
    const plant = new Plant('plant-1', 'My Plant', [], cachedAt);

    findPlantByIdUseCase.findById.mockResolvedValue(plant);

    const dto = await controller.findById('plant-1');

    expect(findPlantByIdUseCase.findById).toHaveBeenCalledWith({
      id: 'plant-1',
    });
    expect(findPlantByIdUseCase.findById).toHaveBeenCalledTimes(1);
    expect(dto.id).toBe('plant-1');
    expect(dto.name).toBe('My Plant');
    expect(dto.cached_at.toISOString()).toBe(cachedAt.toISOString());
    expect(dto.rooms).toEqual([]);
  });
});
