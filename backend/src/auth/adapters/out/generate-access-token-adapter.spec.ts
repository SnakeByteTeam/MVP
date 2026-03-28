import { GenerateAccessTokenAdapter } from './generate-access-token-adapter';

describe('GenerateTokenAdapter', () => {
  const mockToken = 'test';

  const mockJwtAccessTokenGenerator = {
    generateAccessToken: jest.fn().mockReturnValue('test'),
  };

  it('should be defined', () => {
    expect(
      new GenerateAccessTokenAdapter(mockJwtAccessTokenGenerator),
    ).toBeDefined();
  });

  it('should generate refresh token from payload', () => {
    const adapter = new GenerateAccessTokenAdapter(
      mockJwtAccessTokenGenerator as any,
    );

    const result = adapter.generateAccessToken({
      payload: {
        id: 1,
        username: 'user',
        role: 'OPERATORE_SANITARIO',
        firstAccess: false,
      },
    });

    expect(
      mockJwtAccessTokenGenerator.generateAccessToken,
    ).toHaveBeenCalledWith({
      id: 1,
      username: 'user',
      role: 'OPERATORE_SANITARIO',
      firstAccess: false,
    });

    expect(result).toEqual(mockToken);
  });
});
