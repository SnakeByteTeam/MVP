jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

import { AlarmEventsRepositoryImpl } from './alarm-events-repository-impl';

describe('AlarmEventsRepositoryImpl', () => {
  it('should be defined', () => {
    expect(AlarmEventsRepositoryImpl).toBeDefined();
  });
});
