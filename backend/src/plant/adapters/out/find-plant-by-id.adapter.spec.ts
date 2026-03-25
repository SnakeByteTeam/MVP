import { FindPlantByIdAdapter } from './find-plant-by-id.adapter';
import { FindPlantByIdRepoPort } from 'src/plant/application/repository/find-plant-by-id.repository';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';

describe('FindPlantByIdAdapter', () => {
  let adapter: FindPlantByIdAdapter;
  let repoPort: jest.Mocked<FindPlantByIdRepoPort>;

  beforeEach(() => {
    repoPort = {
      findById: jest.fn(),
    };

    adapter = new FindPlantByIdAdapter(repoPort);
  });

  it('should throw PlantId is null when cmd.id is absent', async () => {
    await expect(adapter.findById({ id: '' })).rejects.toThrow(
      Error('PlantId is null'),
    );
  });

  it('should throw when repository returns null', async () => {
    repoPort.findById.mockResolvedValue(null);

    await expect(adapter.findById({ id: 'plant-1' })).rejects.toThrow(
      Error("Can't get plant info from db"),
    );
  });

  it('should return mapped Plant when repository finds entity', async () => {
    const entity = new PlantEntity();
    entity.cached_at = new Date('2026-03-24T12:00:00.000Z');
    entity.data = {
      id: 'plant-1',
      name: 'My Plant',
      rooms: [],
    };

    repoPort.findById.mockResolvedValue(entity);

    const plant = await adapter.findById({ id: 'plant-1' });

    expect(repoPort.findById).toHaveBeenCalledWith('plant-1');
    expect(repoPort.findById).toHaveBeenCalledTimes(1);
    expect(plant.getId()).toBe('plant-1');
    expect(plant.getName()).toBe('My Plant');
    expect(plant.getCachedAt().toISOString()).toBe('2026-03-24T12:00:00.000Z');
  });
});
