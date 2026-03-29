import { WardsRepositoryImpl } from './wards-repository-impl';
import { PoolClient } from 'pg';

describe('WardsRepositoryImpl', () => {
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
    expect(new WardsRepositoryImpl(mockPool as any)).toBeDefined();
  });

  it('deleteWard should unassign apartments, clear cache ward references and delete ward in a transaction', async () => {
    const repository = new WardsRepositoryImpl(mockPool as any);
    mockClient.query = jest.fn().mockResolvedValue({ rowCount: 1 });

    await repository.deleteWard(7);

    expect(mockPool.connect).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(mockClient.query).toHaveBeenNthCalledWith(
      2,
      'UPDATE plant SET ward_id = NULL WHERE ward_id = $1',
      [7],
    );
    expect(mockClient.query).toHaveBeenNthCalledWith(
      3,
      'UPDATE structure_cache SET ward_id = NULL WHERE ward_id IS NOT NULL AND ward_id::text = $1::text',
      [7],
    );
    expect(mockClient.query).toHaveBeenNthCalledWith(
      4,
      'DELETE FROM ward WHERE id = $1',
      [7],
    );
    expect(mockClient.query).toHaveBeenNthCalledWith(5, 'COMMIT');
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it('deleteWard should rollback when a query fails', async () => {
    const repository = new WardsRepositoryImpl(mockPool as any);
    mockClient.query = jest
      .fn()
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(new Error('boom')) // update plant
      .mockResolvedValueOnce(undefined); // ROLLBACK

    await expect(repository.deleteWard(3)).rejects.toThrow('boom');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });
});
