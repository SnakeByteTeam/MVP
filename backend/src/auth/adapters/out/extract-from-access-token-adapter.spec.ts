import { ExtractFromAccessTokenAdapter } from './extract-from-access-token-adapter';

describe('ExtractFromAccessTokenAdapter', () => {
  const mockPayload = { userId: '1', role: 'admin' };

  const mockJwtAccessTokenExtractor = {
    extractAccessTokenPayload: jest.fn().mockReturnValue(mockPayload),
  };

  it('should be defined', () => {
    expect(new ExtractFromAccessTokenAdapter(mockJwtAccessTokenExtractor)).toBeDefined();
  });
});
