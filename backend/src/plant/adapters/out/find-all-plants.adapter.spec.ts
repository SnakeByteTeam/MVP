import { FindAllPlantsRepoPort } from 'src/plant/application/repository/find-all-plants.repository';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';
import { FindAllPlantsAdapter } from './find-all-plants.adapter';

describe('FindAllPlantsAdapter', () => {
  let adapter: FindAllPlantsAdapter;
  let repo: jest.Mocked<FindAllPlantsRepoPort>;

  beforeEach(() => {
    repo = {
      findAllPlants: jest.fn(),
    };
    adapter = new FindAllPlantsAdapter(repo);
  });

  it('should map plant entities to domain objects', async () => {
    const entity = new PlantEntity();
    entity.id = 'plant-1';
    entity.cached_at = new Date('2026-04-07T20:00:00.000Z');
    entity.data = { name: 'Plant one', rooms: [] };
    entity.ward_id = 2;

    repo.findAllPlants.mockResolvedValue([entity]);

    const result = await adapter.findAllPlants();

    expect(repo.findAllPlants).toHaveBeenCalledTimes(1);
    expect(result).not.toBeNull();
    expect(result?.[0].getId()).toBe('plant-1');
    expect(result?.[0].getName()).toBe('Plant one');
    expect(result?.[0].getWardId()).toBe(2);
  });

  it('should return null when repository returns null', async () => {
    repo.findAllPlants.mockResolvedValue(null);

    const result = await adapter.findAllPlants();

    expect(result).toBeNull();
  });
});