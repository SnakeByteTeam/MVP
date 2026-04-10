import { AlarmEventsPersistenceAdapter } from 'src/alarms/adapters/out/alarm-events-persistence-adapter';

describe('AlarmEventsPersistenceAdapter', () => {
  it('should be defined', () => {
    const repositoryMock = {
      getAlarmEventById: jest.fn(),
      getAllAlarmEvents: jest.fn(),
      getAllManagedAlarmEventsByUserId: jest.fn(),
      getAllUnmanagedAlarmEventsByUserId: jest.fn(),
      resolveAlarmEvent: jest.fn(),
      createAlarmEvent: jest.fn(),
      getWardAlarmEvent: jest.fn(),
    };

    expect(new AlarmEventsPersistenceAdapter(repositoryMock as never)).toBeDefined();
  });
});
