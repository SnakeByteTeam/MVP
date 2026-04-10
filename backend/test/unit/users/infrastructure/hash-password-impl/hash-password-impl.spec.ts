import { HashPasswordImpl } from 'src/users/infrastructure/hash-password-impl/hash-password-impl';

describe('HashPasswordImpl', () => {
  it('should be defined', () => {
    expect(new HashPasswordImpl()).toBeDefined();
  });

  it('should generate correct hash', () => {
    expect(new HashPasswordImpl().hashPassword('test')).toEqual(
      'ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff',
    );
  });
});
