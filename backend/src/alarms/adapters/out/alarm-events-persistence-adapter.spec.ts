import { AlarmEventsPersistenceAdapter } from './alarm-events-persistence-adapter';

describe('AlarmEventsPersistenceAdapter', () => {
  it('should be defined', () => {
    const repositoryStub = {
      createAlarmEvent: jest.fn(),
      getAlarmEventById: jest.fn(),
      getAllAlarmEvents: jest.fn(),
      getAllManagedAlarmEventsByUserId: jest.fn(),
      getAllUnmanagedAlarmEventsByUserId: jest.fn(),
      resolveAlarmEvent: jest.fn(),
      getWardAlarmEvent: jest.fn(),
    };

    expect(new AlarmEventsPersistenceAdapter(repositoryStub as any)).toBeDefined();
  });
});
