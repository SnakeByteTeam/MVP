import { mock } from 'node:test';
import { WardsPlantsRelationshipsRepositoryImpl } from './wards-plants-relationships-repository-impl';

describe('WardsPlantsRelationshipsRepositoryImpl', () => {
  let repo: WardsPlantsRelationshipsRepositoryImpl;
  let mockConn: any;

  beforeEach(() => {
    mockConn = {
      query: jest.fn(),
    };
    repo = new WardsPlantsRelationshipsRepositoryImpl(mockConn);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should call query with correct parameters when adding a plant to a ward', async () => {
    mockConn.query.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 'id', name: 'plant' }],
    });

    await repo.addPlantToWard(1, 'id');

    expect(mockConn.query).toHaveBeenCalledWith(
      'UPDATE plant p SET ward_id = $1 WHERE p.id = $2 RETURNING *',
      [1, 'id'],
    );
  });

  it('should return PlantEntity when update succeeds', async () => {
    const mockPlant = { id: 'id', name: 'name' };

    mockConn.query.mockResolvedValue({
      rowCount: 1,
      rows: [mockPlant],
    });

    const result = await repo.addPlantToWard(1, 'id');

    expect(mockConn.query).toHaveBeenCalledWith(
      'UPDATE plant p SET ward_id = $1 WHERE p.id = $2 RETURNING *',
      [1, 'id'],
    );

    expect(result).toEqual(mockPlant);
  });

  it('should throw error when no rows are updated', async () => {
    mockConn.query.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    await expect(repo.addPlantToWard(1, 'id')).rejects.toThrow(
      'Add plant to ward failed',
    );
  });

  it('should propagate DB error on add plant to ward', async () => {
    mockConn.query.mockRejectedValue(new Error('DB error'));

    await expect(repo.addPlantToWard(1, 'id')).rejects.toThrow('DB error');
  });

  it('should return all plants for a ward', async () => {
    const plants = [
      { id: '1', name: 'plant1' },
      { id: '2', name: 'plant2' },
    ];

    mockConn.query.mockResolvedValue({
      rows: plants,
    });

    const result = await repo.findAllPlantsByWardId(1);

    expect(mockConn.query).toHaveBeenCalledWith(
      'SELECT p.id, p.data->>\'name\' name FROM plant p WHERE p.ward_id = $1',
      [1],
    );

    expect(result).toEqual(plants);
  });

  it('should propagate DB error on find all plants by ward id', async () => {
    mockConn.query.mockRejectedValue(new Error('DB error'));

    await expect(repo.findAllPlantsByWardId(1)).rejects.toThrow('DB error');
  });

  it('should call query with correct parameters when removing a plant from a ward', async () => {
    mockConn.query.mockResolvedValue({});

    await repo.removePlantFromWard('id');

    expect(mockConn.query).toHaveBeenCalledWith(
      'UPDATE plant p SET ward_id = NULL WHERE p.id = $1',
      ['id'],
    );
  });

  it('should propagate error when removing plant fails', async () => {
    mockConn.query.mockRejectedValue(new Error('DB error'));

    await expect(repo.removePlantFromWard('id')).rejects.toThrow('DB error');
  });
});
