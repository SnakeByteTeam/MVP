import { ChangeCredentialsCmd } from 'src/auth/application/commands/change-credentials-cmd';

describe('ChangeCredentialsCmd', () => {
  it('should be defined', () => {
    expect(new ChangeCredentialsCmd('', '', true)).toBeDefined();
  });
});
