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
});
