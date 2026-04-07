import { HashPasswordAdapter } from './hash-password-adapter';

describe('HashPasswordAdapter', () => {
  const mockPasswordHasher = {
    hashPassword: jest.fn().mockReturnValue('password'),
  };

  it('should be defined', () => {
    expect(new HashPasswordAdapter(mockPasswordHasher)).toBeDefined();
  });

  it('should generate hashed password from password', () => {
    const adapter = new HashPasswordAdapter(mockPasswordHasher);

    const result = adapter.hashPassword({ password: 'password' });

    expect(mockPasswordHasher.hashPassword).toHaveBeenCalledWith('password');
    expect(result).toEqual('password');
  });
});
