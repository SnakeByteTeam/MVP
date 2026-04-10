import { GenerateChangePasswordRefreshTokenAdapter } from 'src/auth/adapters/out/generate-change-password-refresh-token-adapter';

describe('GenerateChangePasswordRefreshTokenAdapter', () => {
  const mockToken = 'test';

  const mockJwtChangePasswordRefreshTokenGenerator = {
    generateChangePasswordRefreshToken: jest.fn().mockReturnValue('test'),
  };

  it('should be defined', () => {
    expect(
      new GenerateChangePasswordRefreshTokenAdapter(
        mockJwtChangePasswordRefreshTokenGenerator,
      ),
    ).toBeDefined();
  });

  it('should generate refresh token from payload', () => {
    const adapter = new GenerateChangePasswordRefreshTokenAdapter(
      mockJwtChangePasswordRefreshTokenGenerator as any,
    );

    const result = adapter.generateChangePasswordRefreshToken({
      payload: {
        id: 1,
        username: 'user',
        role: 'OPERATORE_SANITARIO',
        firstAccess: false,
      },
    });

    expect(
      mockJwtChangePasswordRefreshTokenGenerator.generateChangePasswordRefreshToken,
    ).toHaveBeenCalledWith({
      id: 1,
      username: 'user',
      role: 'OPERATORE_SANITARIO',
      firstAccess: false,
    });

    expect(result).toEqual(mockToken);
  });
});
