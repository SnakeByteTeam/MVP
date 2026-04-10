import { LoginCmd } from 'src/auth/application/commands/login-cmd';

describe('LoginCmd', () => {
  it('should be defined', () => {
    expect(new LoginCmd('', '')).toBeDefined();
  });
});
