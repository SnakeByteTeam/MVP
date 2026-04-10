import { CheckCredentialsCmd } from 'src/auth/application/commands/check-credentials-cmd';

describe('CheckCredentialsCmd', () => {
  it('should be defined', () => {
    expect(new CheckCredentialsCmd('', '')).toBeDefined();
  });
});
