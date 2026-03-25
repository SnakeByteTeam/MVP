import { TokenPair } from './token-pair.model';

describe('TokenPair', () => {
  let tokenPair: TokenPair;
  const accessToken: string = 'access_token';
  const refreshToken: string = 'refresh_token';
  const expiresAt: Date = new Date(Date.now());

  beforeEach(async () => {
    tokenPair = new TokenPair(accessToken, refreshToken, expiresAt);
  });

  it('should return the access token', async () => {
    expect(tokenPair.getAccessToken()).toBe(accessToken);
  });

  it('should return the refresh token', async () => {
    expect(tokenPair.getRefreshToken()).toBe(refreshToken);
  });

  it('should return the expires at date', async () => {
    expect(tokenPair.getExpiresAt()).toBe(expiresAt);
  });
});
