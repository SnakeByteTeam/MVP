import { HashPasswordCmd } from 'src/auth/application/commands/hash-password-cmd';

describe('HashPasswordCmd', () => {
  it('should be defined', () => {
    expect(new HashPasswordCmd('')).toBeDefined();
  });
});
