import { ExtractFromRefreshTokenAdapter } from 'src/auth/adapters/out/extract-from-refresh-token-adapter';

describe('ExtractFromRefreshTokenAdapter', () => {
  const mockPayload = { userId: '1', role: 'admin' };

  const mockJwtRefreshTokenExtractor = {
    extractRefreshTokenPayload: jest.fn().mockReturnValue(mockPayload),
  };

  it('should be defined', () => {
    expect(
      new ExtractFromRefreshTokenAdapter(mockJwtRefreshTokenExtractor),
    ).toBeDefined();
  });

  it('should extract payload from refresh token', () => {
    const adapter = new ExtractFromRefreshTokenAdapter(
      mockJwtRefreshTokenExtractor as any,
    );

    const result = adapter.extractFromRefreshToken({
      token: 'fake-token',
    });

    expect(
      mockJwtRefreshTokenExtractor.extractRefreshTokenPayload,
    ).toHaveBeenCalledWith('fake-token');

    expect(result).toEqual(mockPayload);
  });

  it('should propagate errors from extractor', () => {
    const mock = {
      extractRefreshTokenPayload: jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      }),
    };

    const adapter = new ExtractFromRefreshTokenAdapter(mock as any);

    expect(() =>
      adapter.extractFromRefreshToken({ token: 'bad-token' }),
    ).toThrow('Invalid token');
  });
});
