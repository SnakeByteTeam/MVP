import { CheckFirstAccessCmd } from 'src/auth/application/commands/check-first-access-cmd';

describe('CheckFirstAccessCmd', () => {
  it('should be defined', () => {
    expect(new CheckFirstAccessCmd('')).toBeDefined();
  });
});
