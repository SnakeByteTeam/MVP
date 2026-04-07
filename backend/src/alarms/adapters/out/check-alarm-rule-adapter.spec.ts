import { CheckAlarmRuleAdapter } from './check-alarm-rule-adapter';
import { CheckAlarmRuleCmd } from '../../application/commands/check-alarm-rule-cmd';
import { CheckAlarmEntity } from '../../infrastructure/entities/check-alarm-entity';
import { CheckAlarm } from '../../domain/models/check-alarm';

describe('CheckAlarmRuleAdapter', () => {
  const repository = {
    checkAlarmRule: jest.fn(),
  };

  const adapter = new CheckAlarmRuleAdapter(repository as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(CheckAlarmRuleAdapter).toBeDefined();
  });

  it('should use UTC time when checking alarm rules', async () => {
    repository.checkAlarmRule.mockResolvedValue(null);

    const cmd = new CheckAlarmRuleCmd(
      'device-1',
      'On',
      new Date('2026-04-07T08:44:11.000Z'),
    );

    await adapter.checkAlarmRule(cmd);

    expect(repository.checkAlarmRule).toHaveBeenCalledWith(
      'device-1',
      'On',
      '08:44',
    );
  });

  it('should map repository entity to domain object', async () => {
    repository.checkAlarmRule.mockResolvedValue({
      alarm_rule_id: 'rule-1',
      ward_id: 10,
      alarm_event_id: null,
    });

    const cmd = new CheckAlarmRuleCmd(
      'device-1',
      'On',
      new Date('2026-04-07T08:44:11.000Z'),
    );

    const result = await adapter.checkAlarmRule(cmd);

    expect(result).toEqual(new CheckAlarm('rule-1', 10, undefined));
    expect(CheckAlarmEntity.toDomain).toBeDefined();
  });

  it('should return null when repository returns null', async () => {
    repository.checkAlarmRule.mockResolvedValue(null);

    const cmd = new CheckAlarmRuleCmd(
      'device-1',
      'On',
      new Date('2026-04-07T08:44:11.000Z'),
    );

    const result = await adapter.checkAlarmRule(cmd);

    expect(result).toBeNull();
  });

  it('should trim incoming value before checking alarm rules', async () => {
    repository.checkAlarmRule.mockResolvedValue(null);

    const cmd = new CheckAlarmRuleCmd(
      'device-1',
      '  On  ',
      new Date('2026-04-07T08:44:11.000Z'),
    );

    await adapter.checkAlarmRule(cmd);

    expect(repository.checkAlarmRule).toHaveBeenCalledWith(
      'device-1',
      'On',
      '08:44',
    );
  });

  it('should map true/false values to on/off before checking alarm rules', async () => {
    repository.checkAlarmRule.mockResolvedValue(null);

    const trueCmd = new CheckAlarmRuleCmd(
      'device-1',
      'True',
      new Date('2026-04-07T08:44:11.000Z'),
    );

    await adapter.checkAlarmRule(trueCmd);

    expect(repository.checkAlarmRule).toHaveBeenLastCalledWith(
      'device-1',
      'on',
      '08:44',
    );

    const falseCmd = new CheckAlarmRuleCmd(
      'device-1',
      ' false ',
      new Date('2026-04-07T08:44:11.000Z'),
    );

    await adapter.checkAlarmRule(falseCmd);

    expect(repository.checkAlarmRule).toHaveBeenLastCalledWith(
      'device-1',
      'off',
      '08:44',
    );
  });
});
