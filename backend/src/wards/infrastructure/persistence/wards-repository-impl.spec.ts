import { WardsRepositoryImpl } from './wards-repository-impl';

describe('WardsRepositoryImpl', () => {
  let repo: WardsRepositoryImpl;
  let mockConn: any;

  beforeEach(() => {
    mockConn = {
      query: jest.fn(),
    };
    repo = new WardsRepositoryImpl(mockConn);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should create a ward and return it', async () => {
    const ward = { id: 1, name: 'ward' };

    mockConn.query.mockResolvedValue({
      rowCount: 1,
      rows: [ward],
    });

    const result = await repo.createWard('ward');

    expect(mockConn.query).toHaveBeenCalledWith(
      'INSERT INTO ward (name) VALUES ($1) RETURNING *',
      ['ward'],
    );

    expect(result).toEqual(ward);
  });

  it('should throw if no ward is created', async () => {
    mockConn.query.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    await expect(repo.createWard('ward')).rejects.toThrow(
      'Create ward not found',
    );
  });

  it('should propagate DB error on create', async () => {
    mockConn.query.mockRejectedValue(new Error('DB error'));

    await expect(repo.createWard('ward')).rejects.toThrow('DB error');
  });

  it('should return all wards', async () => {
    const wards = [
      { id: 1, name: 'w1' },
      { id: 2, name: 'w2' },
    ];

    mockConn.query.mockResolvedValue({
      rows: wards,
    });

    const result = await repo.findAllWards();

    expect(mockConn.query).toHaveBeenCalledWith('SELECT * FROM ward');
    expect(result).toEqual(wards);
  });

  it('should propagate DB error on findAll', async () => {
    mockConn.query.mockRejectedValue(new Error('DB error'));

    await expect(repo.findAllWards()).rejects.toThrow('DB error');
  });

  it('should update ward and return it', async () => {
    const ward = { id: 1, name: 'new name' };

    mockConn.query.mockResolvedValue({
      rowCount: 1,
      rows: [ward],
    });

    const result = await repo.updateWard(1, 'new name');

    expect(mockConn.query).toHaveBeenCalledWith(
      'UPDATE ward SET name = $1 WHERE id = $2 RETURNING *',
      ['new name', 1],
    );

    expect(result).toEqual(ward);
  });

  it('should throw if ward is not updated', async () => {
    mockConn.query.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    await expect(repo.updateWard(1, 'name')).rejects.toThrow(
      'Update ward not found',
    );
  });

  it('should propagate DB error on update', async () => {
    mockConn.query.mockRejectedValue(new Error('DB error'));

    await expect(repo.updateWard(1, 'name')).rejects.toThrow('DB error');
  });

  it('should call query to delete ward', async () => {
    mockConn.query.mockResolvedValue({});

    repo.deleteWard(1);

    expect(mockConn.query).toHaveBeenCalledWith(
      'DELETE FROM ward WHERE id = $1',
      [1],
    );
  });

  it('should propagate DB error on delete', async () => {
    mockConn.query.mockRejectedValue(new Error('DB error'));

    await expect(repo.deleteWard(1)).rejects.toThrow('DB error');
  });
});
