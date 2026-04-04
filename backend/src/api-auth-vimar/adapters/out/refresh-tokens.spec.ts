import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';
import { RefreshTokensAdapter } from './refresh-tokens.adapter';
import { RefreshTokensFromApiPort } from 'src/api-auth-vimar/application/repository/refresh-tokens-from-api.port';

describe('RefreshTokensAdapter', () => {
  let refreshTokenAdapter: RefreshTokensAdapter;
  let refreshTokensFromApi: jest.Mocked<RefreshTokensFromApiPort>;
  let apiTokens: TokensDto;

  beforeEach(() => {
    refreshTokensFromApi = {
      refresh: jest.fn(),
    };

    apiTokens = {
      accessToken: 'access-token-1',
      refreshToken: 'refresh-token-1',
      expiresIn: 600,
    };

    refreshTokenAdapter = new RefreshTokensAdapter(refreshTokensFromApi);
  });

  it('should return refreshed tokens given by API', async () => {
    refreshTokensFromApi.refresh.mockResolvedValue(apiTokens);

    const startTime = Date.now();
    const returnedTokens =
      await refreshTokenAdapter.refreshTokens('my-refresh-token');
    const expectedExpiresTime = startTime + 600 * 1000;

    expect(returnedTokens?.getAccessToken()).toBe(apiTokens.accessToken);
    expect(returnedTokens?.getRefreshToken()).toBe(apiTokens.refreshToken);
    // Allow 100ms tolerance for execution time
    expect(returnedTokens?.getExpiresAt().getTime()).toBeCloseTo(
      expectedExpiresTime,
      -2,
    );
    expect(refreshTokensFromApi.refresh).toHaveBeenCalledTimes(1);
    expect(refreshTokensFromApi.refresh).toHaveBeenCalledWith(
      'my-refresh-token',
    );
  });

  it('should throw an error when tokens given by API are null', async () => {
    refreshTokensFromApi.refresh.mockResolvedValue(null);

    await expect(
      refreshTokenAdapter.refreshTokens('my-refresh-token'),
    ).rejects.toThrow();

    expect(refreshTokensFromApi.refresh).toHaveBeenCalledTimes(1);
    expect(refreshTokensFromApi.refresh).toHaveBeenCalledWith(
      'my-refresh-token',
    );
  });
});
