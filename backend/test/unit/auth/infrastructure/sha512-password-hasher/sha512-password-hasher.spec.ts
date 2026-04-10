import { Sha512PasswordHasher } from 'src/auth/infrastructure/sha512-password-hasher/sha512-password-hasher';

describe('Sha512PasswordHasher', () => {
  let passwordHasher: Sha512PasswordHasher;
  const password = 'password';

  beforeEach(() => {
    passwordHasher = new Sha512PasswordHasher();
  });

  it('should be defined', () => {
    expect(passwordHasher).toBeDefined();
  });

  it('should generate a hashed password ', () => {
    const hashedPassword = passwordHasher.hashPassword(password);

    expect(hashedPassword).toBeDefined();
    expect(typeof hashedPassword).toBe('string');
  });
});
