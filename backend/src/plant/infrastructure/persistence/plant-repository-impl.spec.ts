import { Pool } from 'pg';
import { PlantRepository } from './plant-repository-impl';
import { PlantEntity } from './entities/plant.entity';

describe('PlantRepository', () => {
  let repository: PlantRepository;
  let pool: jest.Mocked<Pick<Pool, 'connect'>>;
  let queryMock: jest.Mock;
  let releaseMock: jest.Mock;

  beforeEach(() => {
    queryMock = jest.fn();
    releaseMock = jest.fn();

    pool = {
      connect: jest.fn().mockResolvedValue({
        query: queryMock,
        release: releaseMock,
      }),
    };

    repository = new PlantRepository(pool as unknown as Pool);
  });

  it('should return PlantEntity when findById query succeeds', async () => {
    const cachedAt = new Date('2026-03-24T12:00:00.000Z');
    queryMock.mockResolvedValue({
      rows: [
        {
          cached_at: cachedAt,
          data: {
            id: 'plant-1',
            name: 'My Plant',
            rooms: [],
          },
        },
      ],
    });

    const result = await repository.findById('plant-1');

    expect(result).toEqual({
      cached_at: cachedAt,
      data: {
        id: 'plant-1',
        name: 'My Plant',
        rooms: [],
      },
    });
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return null when findById query returns no rows', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const result = await repository.findById('plant-1');

    expect(result).toBeNull();
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return null when findById query throws', async () => {
    queryMock.mockRejectedValue(new Error('db error'));

    const result = await repository.findById('plant-1');

    expect(result).toBeNull();
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should write plant structure and return true when query succeeds', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const plant: PlantEntity = {
      cached_at: new Date('2026-03-24T12:00:00.000Z'),
      data: {
        id: 'plant-1',
        name: 'My Plant',
        rooms: [],
      },
    };

    const result = await repository.write(plant);

    expect(result).toBe(true);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO structure_cache'),
      ['plant-1', JSON.stringify(plant.data)],
    );
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return false when write query throws', async () => {
    queryMock.mockRejectedValue(new Error('db error'));

    const plant: PlantEntity = {
      cached_at: new Date('2026-03-24T12:00:00.000Z'),
      data: {
        id: 'plant-1',
        name: 'My Plant',
        rooms: [],
      },
    };

    const result = await repository.write(plant);

    expect(result).toBe(false);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });
});
