import { WardsPlantsRelationshipsRepositoryImpl } from './wards-plants-relationships-repository-impl';
import { PoolClient } from 'pg';

describe('WardsPlantsRelationshipsRepositoryImpl', () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  } as unknown as PoolClient;

  const mockPool = {
    connect: jest.fn().mockResolvedValue(mockClient),
    query: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(new WardsPlantsRelationshipsRepositoryImpl(mockPool as any)).toBeDefined();
  });

  it('addPlantToWard should update plant and cache in the same transaction', async () => {
    const repository = new WardsPlantsRelationshipsRepositoryImpl(mockPool as any);
    mockClient.query = jest
      .fn()
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'apt-101', name: 'App. 101' }] })
      .mockResolvedValueOnce(undefined) // update cache
      .mockResolvedValueOnce(undefined); // COMMIT

    const result = await repository.addPlantToWard(10, 'apt-101');

    expect(result).toEqual({ id: 'apt-101', name: 'App. 101' });
    expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(mockClient.query).toHaveBeenNthCalledWith(
      2,
      'UPDATE plant p SET ward_id = $1 WHERE p.id = $2 RETURNING *',
      [10, 'apt-101'],
    );
    expect(mockClient.query).toHaveBeenNthCalledWith(
      3,
      'UPDATE structure_cache SET ward_id = $1 WHERE plant_id = $2',
      [10, 'apt-101'],
    );
    expect(mockClient.query).toHaveBeenNthCalledWith(4, 'COMMIT');
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it('addPlantToWard should rollback if plant does not exist', async () => {
    const repository = new WardsPlantsRelationshipsRepositoryImpl(mockPool as any);
    mockClient.query = jest
      .fn()
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce(undefined); // ROLLBACK

    await expect(repository.addPlantToWard(10, 'missing')).rejects.toThrow(
      'Add plant to ward failed',
    );

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it('removePlantFromWard should clear assignment and cache in one transaction', async () => {
    const repository = new WardsPlantsRelationshipsRepositoryImpl(mockPool as any);
    mockClient.query = jest
      .fn()
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce(undefined) // update plant
      .mockResolvedValueOnce(undefined) // update cache
      .mockResolvedValueOnce(undefined); // COMMIT

    await repository.removePlantFromWard('apt-101');

    expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(mockClient.query).toHaveBeenNthCalledWith(
      2,
      'UPDATE plant p SET ward_id = NULL WHERE p.id = $1',
      ['apt-101'],
    );
    expect(mockClient.query).toHaveBeenNthCalledWith(
      3,
      'UPDATE structure_cache SET ward_id = NULL WHERE plant_id = $1',
      ['apt-101'],
    );
    expect(mockClient.query).toHaveBeenNthCalledWith(4, 'COMMIT');
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it('removePlantFromWard should rollback on error', async () => {
    const repository = new WardsPlantsRelationshipsRepositoryImpl(mockPool as any);
    mockClient.query = jest
      .fn()
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(undefined); // ROLLBACK

    await expect(repository.removePlantFromWard('apt-101')).rejects.toThrow('boom');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });
});
