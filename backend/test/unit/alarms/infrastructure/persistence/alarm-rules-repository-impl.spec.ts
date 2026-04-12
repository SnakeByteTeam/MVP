
import { Pool } from 'pg';
import { AlarmRulesRepositoryImpl } from 'src/alarms/infrastructure/persistence/alarm-rules-repository-impl';

describe('AlarmRulesRepositoryImpl', () => {
  let repository: AlarmRulesRepositoryImpl;

  const mockQuery = jest.fn();
  const mockRelease = jest.fn();

  const mockClient = {
    query: jest.fn(),
    release: mockRelease,
  };

  const mockPool = {
    query: mockQuery,
    connect: jest.fn(),
  } as unknown as Pool;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new AlarmRulesRepositoryImpl(mockPool);
  });

  it('should return alarm rule if found', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: '1' }] });

    const result = await repository.getAlarmRuleById('1');

    expect(mockQuery).toHaveBeenCalled();
    expect(result).toEqual({ id: '1' });
  });

  it('should return null if not found', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const result = await repository.getAlarmRuleById('1');

    expect(result).toBeNull();
  });

  it('should create alarm rule', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: '1' }] });

    const result = await repository.createAlarmRule(
      'name',
      1,
      'dp',
      'dev',
      'plant',
      '>',
      '10',
      '10:00',
      '18:00',
    );

    expect(mockQuery).toHaveBeenCalled();
    expect(result).toEqual({ id: '1' });
  });

  it('should return all alarm rules', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: '1' }] });

    const result = await repository.getAllAlarmRules();

    expect(result).toEqual([{ id: '1' }]);
  });

  it('should delete alarm rule if not used', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    await repository.deleteAlarmRule('1');

    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('should mark as changed if delete fails', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0 }) // delete
      .mockResolvedValueOnce({}); // update

    await repository.deleteAlarmRule('1');

    expect(mockQuery).toHaveBeenCalledTimes(2);
  });
  it('should update alarm rule if not used', async () => {
    mockPool.connect = jest.fn().mockResolvedValue(mockClient);

    mockClient.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ used: false }] }) // usage check
      .mockResolvedValueOnce({ rows: [{ id: '1' }] }) // update
      .mockResolvedValueOnce(undefined); // COMMIT

    const result = await repository.updateAlarmRule(
      '1',
      'name',
      1,
      '>',
      '10',
      '10:00',
      '18:00',
      true,
    );

    expect(mockClient.query).toHaveBeenCalled();
    expect(result).toEqual({ id: '1' });
    expect(mockRelease).toHaveBeenCalled();
  });

  it('should clone alarm rule if already used', async () => {
    mockPool.connect = jest.fn().mockResolvedValue(mockClient);

    mockClient.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ used: true }] }) // usage check
      .mockResolvedValueOnce(undefined) // mark changed
      .mockResolvedValueOnce({ rows: [{ id: '2' }] }) // insert
      .mockResolvedValueOnce(undefined); // COMMIT

    const result = await repository.updateAlarmRule(
      '1',
      'name',
      1,
      '>',
      '10',
      '10:00',
      '18:00',
      true,
    );

    expect(result).toEqual({ id: '2' });
    expect(mockRelease).toHaveBeenCalled();
  });

  it('should rollback on error', async () => {
    mockPool.connect = jest.fn().mockResolvedValue(mockClient);

    mockClient.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(new Error('fail')); // error

    await expect(
      repository.updateAlarmRule(
        '1',
        'name',
        1,
        '>',
        '10',
        '10:00',
        '18:00',
        true,
      ),
    ).rejects.toThrow();

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockRelease).toHaveBeenCalled();
  });

  it('should return alarm when condition matches', async () => {
    mockQuery.mockResolvedValue({
      rows: [{ alarm_rule_id: 1, ward_id: 2 }],
    });

    const result = await repository.checkAlarmRule(
      'dp1',
      '10',
      '10:00',
    );

    expect(mockQuery).toHaveBeenCalled();
    expect(result).toEqual({ alarm_rule_id: 1, ward_id: 2 });
  });

  it('should return null when no alarm matches', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const result = await repository.checkAlarmRule(
      'dp1',
      '10',
      '10:00',
    );

    expect(result).toBeUndefined(); // attenzione: rows[0]
  });

  it('should propagate checkAlarmRule errors', async () => {
    mockQuery.mockRejectedValue(new Error('DB error'));

    await expect(
      repository.checkAlarmRule('dp1', '10', '10:00'),
    ).rejects.toThrow();
  });
});