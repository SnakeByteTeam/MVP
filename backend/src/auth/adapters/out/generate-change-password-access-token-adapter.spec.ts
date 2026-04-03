import { GenerateChangePasswordAccessTokenAdapter } from './generate-change-password-access-token-adapter';

describe('GenerateChangePasswordAccessTokenAdapter', () => {
  const mockToken = 'test';

  const mockJwtChangePasswordAccessTokenGenerator = {
    generateChangePasswordAccessToken: jest.fn().mockReturnValue('test'),
  };

  it('should be defined', () => {
    expect(
      new GenerateChangePasswordAccessTokenAdapter(
        mockJwtChangePasswordAccessTokenGenerator,
      ),
    ).toBeDefined();
  });

  it('should generate refresh token from payload', () => {
    const adapter = new GenerateChangePasswordAccessTokenAdapter(
      mockJwtChangePasswordAccessTokenGenerator as any,
    );

    const result = adapter.generateChangePasswordAccessToken({
      payload: {
        id: 1,
        username: 'user',
        role: 'OPERATORE_SANITARIO',
        firstAccess: false,
      },
    });

    expect(
      mockJwtChangePasswordAccessTokenGenerator.generateChangePasswordAccessToken,
    ).toHaveBeenCalledWith({
      id: 1,
      username: 'user',
      role: 'OPERATORE_SANITARIO',
      firstAccess: false,
    });

    expect(result).toEqual(mockToken);
  });
});
