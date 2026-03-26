import { ChangeCredentialsCmd } from './change-credentials-cmd';

describe('ChangeCredentialsCmd', () => {
  it('should be defined', () => {
    expect(new ChangeCredentialsCmd("", "", true)).toBeDefined();
  });
});
