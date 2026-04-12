import { AlarmEventsPersistenceAdapter } from 'src/alarms/adapters/out/alarm-events-persistence-adapter';

import { GetAlarmEventByIdCmd } from 'src/alarms/application/commands/get-alarm-event-by-id-cmd';
import { GetAllAlarmEventsCmd } from 'src/alarms/application/commands/get-all-alarm-events-cmd';
import { GetAllManagedAlarmEventsByUserIdCmd } from 'src/alarms/application/commands/get-all-managed-alarm-events-by-user-id-cmd';
import { GetAllUnmanagedAlarmEventsByUserIdCmd } from 'src/alarms/application/commands/get-all-unmanaged-alarm-events-by-user-id-cmd';
import { ResolveAlarmEventCmd } from 'src/alarms/application/commands/resolve-alarm-event-cmd';
import { CreateAlarmEventCmd } from 'src/alarms/application/commands/create-alarm-event-cmd';
import { GetWardAlarmEventCmd } from 'src/alarms/application/commands/get-ward-alarm-event.command';

describe('AlarmEventsPersistenceAdapter', () => {
  let adapter: AlarmEventsPersistenceAdapter;

  const mockRepo = {
    getAlarmEventById: jest.fn(),
    getAllAlarmEvents: jest.fn(),
    getAllManagedAlarmEventsByUserId: jest.fn(),
    getAllUnmanagedAlarmEventsByUserId: jest.fn(),
    resolveAlarmEvent: jest.fn(),
    createAlarmEvent: jest.fn(),
    getWardAlarmEvent: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new AlarmEventsPersistenceAdapter(mockRepo as any);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.getAlarmEventById and map result', async () => {
    const cmd = new GetAlarmEventByIdCmd('1');

    mockRepo.getAlarmEventById.mockResolvedValue({
      id: 1,
      plant_name: 'plant',
      room_name: 'room',
      device_name: 'device',
      alarm_rule_id: 10,
      alarm_name: 'alarm',
      priority: 1,
      activation_time: '2024-01-01',
      resolution_time: null,
      user_id: 5,
      user_username: 'user',
    });

    const result = await adapter.getAlarmEventById(cmd);

    expect(mockRepo.getAlarmEventById).toHaveBeenCalledWith('1');
    expect(result?.getId()).toBe(1);
    expect(result?.getAlarmName()).toBe('alarm');
  });

  it('should return null when alarm event not found', async () => {
    const cmd = new GetAlarmEventByIdCmd('1');

    mockRepo.getAlarmEventById.mockResolvedValue(null);

    const result = await adapter.getAlarmEventById(cmd);

    expect(result).toBeNull();
  });

  it('should propagate getAlarmEventById errors', async () => {
    const cmd = new GetAlarmEventByIdCmd('1');

    const error = new Error('DB error');
    mockRepo.getAlarmEventById.mockRejectedValue(error);

    await expect(adapter.getAlarmEventById(cmd)).rejects.toThrow(error);
  });

  it('should call repository.getAllAlarmEvents and map result', async () => {
    const cmd = new GetAllAlarmEventsCmd(10, 0);

    mockRepo.getAllAlarmEvents.mockResolvedValue([
      {
        id: 1,
        plant_name: 'plant',
        room_name: 'room',
        device_name: 'device',
        alarm_rule_id: 10,
        alarm_name: 'alarm',
        priority: 1,
        activation_time: '2024-01-01',
        resolution_time: null,
        user_id: 5,
        user_username: 'user',
      },
    ]);

    const result = await adapter.getAllAlarmEvents(cmd);

    expect(mockRepo.getAllAlarmEvents).toHaveBeenCalledWith(10, 0);
    expect(result.length).toBe(1);
  });

  it('should propagate getAllAlarmEvents errors', async () => {
    const cmd = new GetAllAlarmEventsCmd(10, 0);

    const error = new Error('DB error');

    mockRepo.getAllAlarmEvents.mockRejectedValue(error);

    await expect(adapter.getAllAlarmEvents(cmd)).rejects.toThrow(error);
  });

  it('should call repository.getAllManagedAlarmEventsByUserId', async () => {
    const cmd = new GetAllManagedAlarmEventsByUserIdCmd(1, 10, 0);

    mockRepo.getAllManagedAlarmEventsByUserId.mockResolvedValue([
      {
        id: 1,
        plant_name: 'plant',
        room_name: 'room',
        device_name: 'device',
        alarm_rule_id: 10,
        alarm_name: 'alarm',
        priority: 1,
        activation_time: '2024-01-01',
        resolution_time: null,
        user_id: 5,
        user_username: 'user',
      },
    ]);

    const result = await adapter.getAllManagedAlarmEventsByUserId(cmd);

    expect(mockRepo.getAllManagedAlarmEventsByUserId).toHaveBeenCalledWith(
      1,
      10,
      0,
    );

    expect(result.length).toBe(1);
  });

  it('should call repository.getAllUnmanagedAlarmEventsByUserId', async () => {
    const cmd = new GetAllUnmanagedAlarmEventsByUserIdCmd(1, 10, 0);

    mockRepo.getAllUnmanagedAlarmEventsByUserId.mockResolvedValue([
      {
        id: 1,
        plant_name: 'plant',
        room_name: 'room',
        device_name: 'device',
        alarm_rule_id: 10,
        alarm_name: 'alarm',
        priority: 1,
        activation_time: '2024-01-01',
        resolution_time: null,
        user_id: 5,
        user_username: 'user',
      },
    ]);

    const result = await adapter.getAllUnmanagedAlarmEventsByUserId(cmd);

    expect(mockRepo.getAllUnmanagedAlarmEventsByUserId).toHaveBeenCalledWith(
      1,
      10,
      0,
    );

    expect(result.length).toBe(1);
  });

  it('should call repository.resolveAlarmEvent', async () => {
    const cmd = new ResolveAlarmEventCmd('alarm-1', 5);

    mockRepo.resolveAlarmEvent.mockResolvedValue(undefined);

    await adapter.resolveAlarmEvent(cmd);

    expect(mockRepo.resolveAlarmEvent).toHaveBeenCalledWith('alarm-1', 5);
  });

  it('should propagate resolveAlarmEvent errors', async () => {
    const cmd = new ResolveAlarmEventCmd('alarm-1', 5);

    const error = new Error('DB error');

    mockRepo.resolveAlarmEvent.mockRejectedValue(error);

    await expect(adapter.resolveAlarmEvent(cmd)).rejects.toThrow(error);
  });

  it('should call repository.createAlarmEvent', async () => {
    const date = new Date();
    const cmd = new CreateAlarmEventCmd('rule-1', date);

    mockRepo.createAlarmEvent.mockResolvedValue('event-1');

    const result = await adapter.createAlarmEvent(cmd);

    expect(mockRepo.createAlarmEvent).toHaveBeenCalledWith(
      'rule-1',
      date,
    );

    expect(result).toBe('event-1');
  });

  it('should call repository.getWardAlarmEvent', async () => {
    mockRepo.getWardAlarmEvent.mockResolvedValue(99);

    const result = await adapter.getWardAlarmEvent({alarmId: 'alarm-1'});

    expect(mockRepo.getWardAlarmEvent).toHaveBeenCalledWith('alarm-1');
    expect(result).toBe(99);
  });

  it('should throw if getWardAlarmEvent cmd is invalid', async () => {
    await expect(
      adapter.getWardAlarmEvent({ alarmId: '' } as any),
    ).rejects.toThrow('Invalid command: alarmId is required');
  });

  it('should propagate getWardAlarmEvent errors', async () => {
    mockRepo.getWardAlarmEvent.mockRejectedValue(new Error('DB error'));

    await expect(adapter.getWardAlarmEvent({alarmId: ''})).rejects.toThrow();
  });
});