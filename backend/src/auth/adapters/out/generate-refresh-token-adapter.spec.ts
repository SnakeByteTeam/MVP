import { GenerateRefreshTokenAdapter } from './generate-refresh-token-adapter';

describe('GenerateRefreshTokenAdapter', () => {
  const mockToken = 'test';

  const mockJwtRefreshTokenGenerator = {
    generateRefreshToken: jest.fn().mockReturnValue('test'),
  };

  it('should be defined', () => {
    expect(
      new GenerateRefreshTokenAdapter(mockJwtRefreshTokenGenerator),
    ).toBeDefined();
  });

  it('should generate refresh token from payload', () => {
    const adapter = new GenerateRefreshTokenAdapter(
      mockJwtRefreshTokenGenerator as any,
    );

    const result = adapter.generateRefreshToken({
      payload: { id: 1, role: 'admin', firstAccess: false },
    });

    expect(
      mockJwtRefreshTokenGenerator.generateRefreshToken,
    ).toHaveBeenCalledWith({ id: 1, role: 'admin', firstAccess: false });

    expect(result).toEqual(mockToken);
  });
});
