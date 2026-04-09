import { WriteTokensCachePort } from 'src/api-auth-vimar/application/repository/write-tokens-cache.port';
import { WriteTokensRepoAdapter } from './write-tokens-repo.adapter';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';
import { ReadTokensCachePort } from 'src/api-auth-vimar/application/repository/read-tokens-cache.port';

describe('WriteTokensRepoAdapter', () => {
  let writeTokensAdapter: WriteTokensRepoAdapter;
  let writeTokensOnCache: jest.Mocked<WriteTokensCachePort>;
  let readTokensOnCache: jest.Mocked<ReadTokensCachePort>;
  let tokens: TokenPair;
  let date: Date;

  beforeEach(() => {
    writeTokensOnCache = {
      writeTokens: jest.fn(),
    };

    readTokensOnCache = {
      readTokens: jest.fn(),
    };

    date = new Date(Date.now());
    tokens = new TokenPair('access-token-1', 'refresh-token-1', date);

    writeTokensAdapter = new WriteTokensRepoAdapter(
      writeTokensOnCache,
      readTokensOnCache,
    );
  });

  it('received the tokens should call the cache impl function', async () => {
    writeTokensOnCache.writeTokens.mockResolvedValue(true);

    await expect(
      writeTokensAdapter.writeTokens(tokens, 42, 'utente@example.com'),
    ).resolves.toBe(true);
    expect(writeTokensOnCache.writeTokens).toHaveBeenCalledTimes(1);
    expect(writeTokensOnCache.writeTokens).toHaveBeenCalledWith(
      'access-token-1',
      'refresh-token-1',
      date,
      42,
      'utente@example.com',
    );
  });

  it('should fallback to cached user metadata when omitted', async () => {
    writeTokensOnCache.writeTokens.mockResolvedValue(true);
    readTokensOnCache.readTokens.mockResolvedValue({
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      userId: 7,
      email: 'cached@example.com',
    });

    await expect(writeTokensAdapter.writeTokens(tokens)).resolves.toBe(true);

    expect(readTokensOnCache.readTokens).toHaveBeenCalledTimes(1);
    expect(writeTokensOnCache.writeTokens).toHaveBeenCalledWith(
      'access-token-1',
      'refresh-token-1',
      date,
      7,
      'cached@example.com',
    );
  });
});
