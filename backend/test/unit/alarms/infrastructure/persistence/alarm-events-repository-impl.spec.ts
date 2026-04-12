import { AlarmEventsRepositoryImpl } from "src/alarms/infrastructure/persistence/alarm-events-repository-impl";

describe('AlarmEventsRepositoryImpl', () => {
  let repository: AlarmEventsRepositoryImpl;

  const mockPool = {
    query: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new AlarmEventsRepositoryImpl(mockPool as any);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should call getAllAlarmEvents with correct args', async () => {
    mockPool.query.mockResolvedValue({ rows: [{ id: '1' }] });

    const result = await repository.getAllAlarmEvents(10, 5);

    expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [10, 5]);
    expect(result).toEqual([{ id: '1' }]);
  });

  it('should return alarm event if found', async () => {
    mockPool.query.mockResolvedValue({ rows: [{ id: '1' }] });

    const result = await repository.getAlarmEventById('1');

    expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), ['1']);
    expect(result).toEqual({ id: '1' });
  });

  it('should return null if not found', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const result = await repository.getAlarmEventById('1');

    expect(result).toBeNull();
  });

  it('should call getAllManagedAlarmEventsByUserId', async () => {
    mockPool.query.mockResolvedValue({ rows: [{ id: '1' }] });

    const result = await repository.getAllManagedAlarmEventsByUserId(1, 10, 0);

    expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [1, 10, 0]);
    expect(result).toEqual([{ id: '1' }]);
  });

  it('should call getAllUnmanagedAlarmEventsByUserId', async () => {
    mockPool.query.mockResolvedValue({ rows: [{ id: '1' }] });

    const result = await repository.getAllUnmanagedAlarmEventsByUserId(1, 10, 0);

    expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [1, 10, 0]);
    expect(result).toEqual([{ id: '1' }]);
  });

  it('should call resolveAlarmEvent with correct args', async () => {
    mockPool.query.mockResolvedValue(undefined);

    await repository.resolveAlarmEvent('alarm1', 1);

    expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
      'alarm1',
      1,
    ]);
  });

  it('should create alarm event and return id', async () => {
    mockPool.query.mockResolvedValue({
      rows: [{ id: 'generated-id' }],
    });

    const result = await repository.createAlarmEvent('rule1', new Date());

    expect(mockPool.query).toHaveBeenCalled();
    expect(result).toBe('generated-id');
  });

  it('should return empty string if no id returned', async () => {
    mockPool.query.mockResolvedValue({
      rows: [],
    });

    const result = await repository.createAlarmEvent('rule1', new Date());

    expect(result).toBe('');
  });

  it('should return wardId if found', async () => {
    mockPool.query.mockResolvedValue({
      rows: [{ ward_id: 5 }],
    });

    const result = await repository.getWardAlarmEvent('alarm1');

    expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), ['alarm1']);
    expect(result).toBe(5);
  });

  it('should throw error if wardId is null', async () => {
    mockPool.query.mockResolvedValue({
      rows: [{ ward_id: null }],
    });

    await expect(
      repository.getWardAlarmEvent('alarm1'),
    ).rejects.toThrow('Ward not found for alarm event alarm1');
  });

  it('should throw error if no rows returned', async () => {
    mockPool.query.mockResolvedValue({
      rows: [],
    });

    await expect(
      repository.getWardAlarmEvent('alarm1'),
    ).rejects.toThrow('Ward not found for alarm event alarm1');
  });

  it('should use default params in getAllAlarmEvents', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    await repository.getAllAlarmEvents();

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.any(String),
      [5, 0]
    );
  });

  it('should use default params in getAllManagedAlarmEventsByUserId', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    await repository.getAllManagedAlarmEventsByUserId(1);

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.any(String),
      [1, 10, 0]
    );
  });
});