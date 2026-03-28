import { GenerateChangePasswordRefreshTokenAdapter } from './generate-change-password-refresh-token-adapter';

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
      payload: { id: 1, role: 'admin', firstAccess: false },
    });

    expect(
      mockJwtChangePasswordRefreshTokenGenerator.generateChangePasswordRefreshToken,
    ).toHaveBeenCalledWith({ id: 1, role: 'admin', firstAccess: false });

    expect(result).toEqual(mockToken);
  });
});
