import { AlarmRulesRepositoryImpl } from './alarm-rules-repository-impl';

describe('AlarmRulesRepositoryImpl', () => {
  it('should be defined', () => {
    expect(
      new AlarmRulesRepositoryImpl({
        query: jest.fn(),
      } as any),
    ).toBeDefined();
  });
});
