import { ReadTokensCachePort } from 'src/api-auth-vimar/application/repository/read-tokens-cache.port';
import { ReadTokensFromRepoAdapter } from './read-tokens-from-repo.adapter';
import { TokenEntity } from 'src/api-auth-vimar/infrastructure/persistence/entities/tokens.entity';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';

describe('ReadTokensFromRepoAdapter', () => {
  let readTokensAdapter: ReadTokensFromRepoAdapter;
  let readTokensFromRepo: jest.Mocked<ReadTokensCachePort>;
  let tokenEntity: TokenEntity;

  beforeEach(() => {
    readTokensFromRepo = {
      readTokens: jest.fn(),
    };

    tokenEntity = {
      accessToken: 'access_token_1',
      refreshToken: 'refresh_token_1',
      expiresAt: new Date(Date.now()),
      userId: 42,
      email: 'utente@example.com',
    };

    readTokensAdapter = new ReadTokensFromRepoAdapter(readTokensFromRepo);
  });

  it('should read the tokens from the repo and return a TokenPair', async () => {
    readTokensFromRepo.readTokens.mockResolvedValue(tokenEntity);

    const returnedTokens: TokenPair = await readTokensAdapter.readTokens();

    expect(returnedTokens.getAccessToken()).toBe(tokenEntity.accessToken);
    expect(returnedTokens.getRefreshToken()).toBe(tokenEntity.refreshToken);
    expect(returnedTokens.getExpiresAt()).toBe(tokenEntity.expiresAt);
    expect(readTokensFromRepo.readTokens).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when repo return null', async () => {
    readTokensFromRepo.readTokens.mockResolvedValue(null);

    await expect(readTokensAdapter.readTokens()).rejects.toThrow();

    expect(readTokensFromRepo.readTokens).toHaveBeenCalledTimes(1);
  });
});
