import { WriteTokensCachePort } from 'src/tokens/application/repository/write-tokens-cache.port';
import { WriteTokensRepoAdapter } from './write-tokens-repo.adapter';
import { TokenPair } from 'src/tokens/domain/models/token-pair.model';

describe('WriteTokensRepoAdapter', () => {
  let writeTokensAdapter: WriteTokensRepoAdapter;
  let writeTokensOnCache: jest.Mocked<WriteTokensCachePort>;
  let tokens: TokenPair;
  let date: Date;

  beforeEach(() => {
    writeTokensOnCache = {
      writeTokens: jest.fn(),
    };

    date = new Date(Date.now());
    tokens = new TokenPair('access-token-1', 'refresh-token-1', date);

    writeTokensAdapter = new WriteTokensRepoAdapter(writeTokensOnCache);
  });

  it('received the tokens should call the cache impl function', async () => {
    writeTokensOnCache.writeTokens.mockResolvedValue(true);

    expect(writeTokensAdapter.writeTokens(tokens)).toBeTruthy();
    expect(writeTokensOnCache.writeTokens).toHaveBeenCalledTimes(1);
    expect(writeTokensOnCache.writeTokens).toHaveBeenCalledWith(
      'access-token-1',
      'refresh-token-1',
      date,
    );
  });
});
