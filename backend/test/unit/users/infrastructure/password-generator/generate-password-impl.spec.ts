import { GeneratePasswordImpl } from 'src/users/infrastructure/password-generator/generate-password-impl';

describe('PasswordGenerator', () => {
  it('should be defined', () => {
    expect(new GeneratePasswordImpl()).toBeDefined();
  });

  it('should generate correct length', () => {
    expect(
      new GeneratePasswordImpl().generatePassword(128).length,
    ).toBeLessThanOrEqual(128);
  });
});
