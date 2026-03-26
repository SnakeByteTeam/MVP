import { ExtractFromAccessTokenAdapter } from './extract-from-access-token-adapter';

describe('ExtractFromAccessTokenAdapter', () => {
  const mockPayload = { userId: '1', role: 'admin' };

  const mockJwtAccessTokenExtractor = {
    extractAccessTokenPayload: jest.fn().mockReturnValue(mockPayload),
  };

  it('should be defined', () => {
    expect(
      new ExtractFromAccessTokenAdapter(mockJwtAccessTokenExtractor),
    ).toBeDefined();
  });

  it('should extract payload from refresh token', () => {
    const adapter = new ExtractFromAccessTokenAdapter(
      mockJwtAccessTokenExtractor as any,
    );

    const result = adapter.extractFromAccessToken({
      token: 'fake-token',
    });

    expect(
      mockJwtAccessTokenExtractor.extractAccessTokenPayload,
    ).toHaveBeenCalledWith('fake-token');

    expect(result).toEqual(mockPayload);
  });

  it('should propagate errors from extractor', () => {
    const mock = {
      extractAccessTokenPayload: jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      }),
    };

    const adapter = new ExtractFromAccessTokenAdapter(mock as any);

    expect(() =>
      adapter.extractFromAccessToken({ token: 'bad-token' }),
    ).toThrow('Invalid token');
  });
});
