import { FirstLoginCmd } from 'src/auth/application/commands/first-login-cmd';

describe('FirstLoginCmd', () => {
  it('should be defined', () => {
    expect(new FirstLoginCmd('', '', '')).toBeDefined();
  });
});
