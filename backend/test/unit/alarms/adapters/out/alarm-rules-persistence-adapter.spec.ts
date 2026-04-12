import { AlarmRulesPersistenceAdapter } from 'src/alarms/adapters/out/alarm-rules-persistence-adapter';

import { CreateAlarmRuleCmd } from 'src/alarms/application/commands/create-alarm-rule.cmd';
import { UpdateAlarmRuleCmd } from 'src/alarms/application/commands/update-alarm-rule.cmd';
import { DeleteAlarmRuleCmd } from 'src/alarms/application/commands/delete-alarm-rule-cmd';
import { GetAlarmRuleByIdCmd } from 'src/alarms/application/commands/get-alarm-rule-by-id-cmd';
import { CheckAlarmRuleCmd } from 'src/alarms/application/commands/check-alarm-rule-cmd';

describe('AlarmRulesPersistenceAdapter', () => {
  let adapter: AlarmRulesPersistenceAdapter;

  const mockRepo = {
    createAlarmRule: jest.fn(),
    deleteAlarmRule: jest.fn(),
    getAlarmRuleById: jest.fn(),
    getAllAlarmRules: jest.fn(),
    updateAlarmRule: jest.fn(),
    checkAlarmRule: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new AlarmRulesPersistenceAdapter(mockRepo as any);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.createAlarmRule with correct args', async () => {
    const cmd = new CreateAlarmRuleCmd(
      'name',
      'dp1',
      'dev1',
      'plant1',
      1,
      '>',
      '10',
      '10:00',
      '18:00',
    );

    mockRepo.createAlarmRule.mockResolvedValue({
      id: 1,
      plant_name: 'plant',
      room_name: 'room',
      device_name: 'device',
      datapoint_name: 'dp',
      name: 'alarm',
      threshold_operator: '>',
      threshold_value: '10',
      priority: 1,
      arming_time: '10:00',
      dearming_time: '18:00',
      is_armed: false,
    });

    const result = await adapter.createAlarmRule(cmd);

    expect(mockRepo.createAlarmRule).toHaveBeenCalledWith(
      'name',
      1,
      'dp1',
      'dev1',
      'plant1',
      '>',
      '10',
      '10:00',
      '18:00',
    );

    expect(result).toBeDefined();
    expect(result.getId()).toBe(1);
  });

  it('should propagate createAlarmRule errors', async () => {
    const cmd = new CreateAlarmRuleCmd(
      'name',
      'dp1',
      'dev1',
      'plant1',
      1,
      '>',
      '10',
      '10:00',
      '18:00',
    );

    const error = new Error('DB error');
    mockRepo.createAlarmRule.mockRejectedValue(error);

    await expect(adapter.createAlarmRule(cmd)).rejects.toThrow(error);
  });

  it('should call repository.updateAlarmRule with correct args', async () => {
    const cmd = new UpdateAlarmRuleCmd(
      '1',
      'name',
      1,
      '>',
      '10',
      '10:00',
      '18:00',
      true,
    );

    mockRepo.updateAlarmRule.mockResolvedValue({
      id: 1,
      plant_name: 'plant',
      room_name: 'room',
      device_name: 'device',
      datapoint_name: 'dp',
      name: 'alarm',
      threshold_operator: '>',
      threshold_value: '10',
      priority: 1,
      arming_time: '10:00',
      dearming_time: '18:00',
      is_armed: true,
    });

    const result = await adapter.updateAlarmRule(cmd);

    expect(mockRepo.updateAlarmRule).toHaveBeenCalledWith(
      '1',
      'name',
      1,
      '>',
      '10',
      '10:00',
      '18:00',
      true,
    );

    expect(result).toBeDefined();
    expect(result.getId()).toBe(1);
  });

  it('should propagate updateAlarmRule errors', async () => {
    const cmd = new UpdateAlarmRuleCmd(
      '1',
      'name',
      1,
      '>',
      '10',
      '10:00',
      '18:00',
      true,
    );

    const error = new Error('DB error');
    mockRepo.updateAlarmRule.mockRejectedValue(error);

    await expect(adapter.updateAlarmRule(cmd)).rejects.toThrow(error);
  });

  it('should call repository.deleteAlarmRule with correct args', async () => {
    const cmd = new DeleteAlarmRuleCmd('1');

    mockRepo.deleteAlarmRule.mockResolvedValue(undefined);

    await adapter.deleteAlarmRule(cmd);

    expect(mockRepo.deleteAlarmRule).toHaveBeenCalledWith('1');
  });

  it('should propagate deleteAlarmRule errors', async () => {
    const cmd = new DeleteAlarmRuleCmd('1');

    const error = new Error('DB error');
    mockRepo.deleteAlarmRule.mockRejectedValue(error);

    await expect(adapter.deleteAlarmRule(cmd)).rejects.toThrow(error);
  });

  it('should call repository.getAlarmRuleById', async () => {
    const cmd = new GetAlarmRuleByIdCmd('1');

    mockRepo.getAlarmRuleById.mockResolvedValue({
      id: 1,
      plant_name: 'plant',
      room_name: 'room',
      device_name: 'device',
      datapoint_name: 'dp',
      name: 'alarm',
      threshold_operator: '>',
      threshold_value: '10',
      priority: 1,
      arming_time: '10:00',
      dearming_time: '18:00',
      is_armed: false,
    });

    const result = await adapter.getAlarmRuleById(cmd);

    expect(mockRepo.getAlarmRuleById).toHaveBeenCalledWith('1');
    expect(result?.getId()).toBe(1);
  });

  it('should return null if alarm rule not found', async () => {
    const cmd = new GetAlarmRuleByIdCmd('1');

    mockRepo.getAlarmRuleById.mockResolvedValue(null);

    const result = await adapter.getAlarmRuleById(cmd);

    expect(result).toBeNull();
  });

  it('should propagate getAlarmRuleById errors', async () => {
    const cmd = new GetAlarmRuleByIdCmd('1');

    const error = new Error('DB error');
    mockRepo.getAlarmRuleById.mockRejectedValue(error);

    await expect(adapter.getAlarmRuleById(cmd)).rejects.toThrow(error);
  });

  // ---------------- GET ALL ----------------
  it('should call repository.getAllAlarmRules', async () => {
    mockRepo.getAllAlarmRules.mockResolvedValue([
      {
        id: 1,
        plant_name: 'plant',
        room_name: 'room',
        device_name: 'device',
        datapoint_name: 'dp',
        name: 'alarm',
        threshold_operator: '>',
        threshold_value: '10',
        priority: 1,
        arming_time: '10:00',
        dearming_time: '18:00',
        is_armed: false,
      },
    ]);

    const result = await adapter.getAllAlarmRules();

    expect(mockRepo.getAllAlarmRules).toHaveBeenCalled();
    expect(result.length).toBe(1);
  });

  it('should propagate getAllAlarmRules errors', async () => {
    const error = new Error('DB error');

    mockRepo.getAllAlarmRules.mockRejectedValue(error);

    await expect(adapter.getAllAlarmRules()).rejects.toThrow(error);
  });

  // ---------------- CHECK ----------------
  it('should call repository.checkAlarmRule', async () => {
    const cmd = new CheckAlarmRuleCmd(
      'dp1',
      '10',
      new Date('2024-01-01T10:10:00Z'),
    );

    mockRepo.checkAlarmRule.mockResolvedValue({
      alarm_rule_id: 1,
      ward_id: 2,
      alarm_event_id: null,
    });

    const result = await adapter.checkAlarmRule(cmd);

    expect(mockRepo.checkAlarmRule).toHaveBeenCalled();
    expect(result?.alarmRuleId).toBe(1);
  });

  it('should return null if checkAlarmRule returns null', async () => {
    const cmd = new CheckAlarmRuleCmd(
      'dp1',
      '10',
      new Date('2024-01-01T10:10:00Z'),
    );

    mockRepo.checkAlarmRule.mockResolvedValue(null);

    const result = await adapter.checkAlarmRule(cmd);

    expect(result).toBeNull();
  });

  it('should propagate checkAlarmRule errors', async () => {
    const cmd = new CheckAlarmRuleCmd(
      'dp1',
      '10',
      new Date('2024-01-01T10:10:00Z'),
    );

    const error = new Error('DB error');

    mockRepo.checkAlarmRule.mockRejectedValue(error);

    await expect(adapter.checkAlarmRule(cmd)).rejects.toThrow(error);
  });

  it('should return null if ward_id is null', async () => {
    const cmd = new CheckAlarmRuleCmd(
      'dp1',
      '10',
      new Date('2024-01-01T10:10:00Z'),
    );

    mockRepo.checkAlarmRule.mockResolvedValue({
      alarm_rule_id: 1,
      ward_id: null,
      alarm_event_id: null,
    });

    const result = await adapter.checkAlarmRule(cmd);

    expect(result).toBeNull();
  });

  it('should normalize value "true" to "on"', async () => {
    const cmd = new CheckAlarmRuleCmd(
      'dp1',
      'true',
      new Date('2024-01-01T10:10:00Z'),
    );

    mockRepo.checkAlarmRule.mockResolvedValue({
      alarm_rule_id: 1,
      ward_id: 2,
      alarm_event_id: null,
    });

    await adapter.checkAlarmRule(cmd);

    expect(mockRepo.checkAlarmRule).toHaveBeenCalledWith(
      'dp1',
      'on',
      expect.any(String),
    );
  });

  it('should normalize value "false" to "off"', async () => {
    const cmd = new CheckAlarmRuleCmd(
      'dp1',
      'false',
      new Date('2024-01-01T10:10:00Z'),
    );

    mockRepo.checkAlarmRule.mockResolvedValue({
      alarm_rule_id: 1,
      ward_id: 2,
      alarm_event_id: null,
    });

    await adapter.checkAlarmRule(cmd);

    expect(mockRepo.checkAlarmRule).toHaveBeenCalledWith(
      'dp1',
      'off',
      expect.any(String),
    );
  });
});