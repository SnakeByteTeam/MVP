import { FindAllAvailablePlantsAdapter } from './find-all-available-plants.adapter';
import { FindAllAvailablePlantsRepoPort } from 'src/plant/application/repository/find-all-plants.repository';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';
import { Plant } from 'src/plant/domain/models/plant.model';

describe('FindAllAvailablePlantsAdapter', () => {
  let adapter: FindAllAvailablePlantsAdapter;
  let repo: jest.Mocked<FindAllAvailablePlantsRepoPort>;

  beforeEach(() => {
    repo = {
      findAllAvailablePlants: jest.fn(),
    };

    adapter = new FindAllAvailablePlantsAdapter(repo);
  });

  it('should return null when no plants available', async () => {
    repo.findAllAvailablePlants.mockResolvedValue(null);

    const result = await adapter.findAllAvailablePlants();

    expect(result).toBeNull();
    expect(repo.findAllAvailablePlants).toHaveBeenCalledTimes(1);
  });

  it('should map plant entities to domain models', async () => {
    const plantEntity1: PlantEntity = {
      id: 'plant-1',
      cached_at: new Date(),
      ward_id: 1,
      data: {
        name: 'Plant A',
        rooms: [],
      },
    };
    const plantEntity2: PlantEntity = {
      id: 'plant-2',
      cached_at: new Date(),
      ward_id: 2,
      data: {
        name: 'Plant B',
        rooms: [],
      },
    };

    repo.findAllAvailablePlants.mockResolvedValue([plantEntity1, plantEntity2]);

    const result = await adapter.findAllAvailablePlants();

    expect(result).toHaveLength(2);
    expect(result?.[0]).toBeInstanceOf(Plant);
    expect(result?.[1]).toBeInstanceOf(Plant);
    expect(result?.[0].getName()).toBe('Plant A');
    expect(result?.[1].getName()).toBe('Plant B');
  });

  it('should return empty array when no plants in result', async () => {
    repo.findAllAvailablePlants.mockResolvedValue([]);

    const result = await adapter.findAllAvailablePlants();

    expect(result).toEqual([]);
  });

  it('should throw error when repo fails', async () => {
    repo.findAllAvailablePlants.mockRejectedValue(
      new Error('Database connection failed'),
    );

    await expect(adapter.findAllAvailablePlants()).rejects.toThrow(
      'Database connection failed',
    );
  });
});
