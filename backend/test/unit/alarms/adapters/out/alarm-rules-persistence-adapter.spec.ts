import { AlarmRulesPersistenceAdapter } from 'src/alarms/adapters/out/alarm-rules-persistence-adapter';

describe('AlarmRulesPersistenceAdapter', () => {
  it('should be defined', () => {
    const repositoryMock = {
      createAlarmRule: jest.fn(),
      deleteAlarmRule: jest.fn(),
      getAlarmRuleById: jest.fn(),
      getAllAlarmRules: jest.fn(),
      updateAlarmRule: jest.fn(),
      checkAlarmRule: jest.fn(),
    };

    expect(
      new AlarmRulesPersistenceAdapter(repositoryMock as any),
    ).toBeDefined();
  });
});
