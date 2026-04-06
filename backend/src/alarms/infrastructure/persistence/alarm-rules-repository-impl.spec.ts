jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

import { AlarmRulesRepositoryImpl } from './alarm-rules-repository-impl';

describe('AlarmRulesRepositoryImpl', () => {
  it('should be defined', () => {
    expect(AlarmRulesRepositoryImpl).toBeDefined();
  });
});
