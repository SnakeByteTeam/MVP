import { DeleteTokensFromRepoAdapter } from './delete-tokens-from-repo.adapter';
import { DeleteTokensCachePort } from 'src/api-auth-vimar/application/repository/delete-tokens-cache.port';

describe('DeleteTokensFromRepoAdapter', () => {
  let adapter: DeleteTokensFromRepoAdapter;
  let deleteTokensCachePort: jest.Mocked<DeleteTokensCachePort>;

  beforeEach(() => {
    deleteTokensCachePort = {
      deleteTokens: jest.fn(),
    };

    adapter = new DeleteTokensFromRepoAdapter(deleteTokensCachePort);
  });

  it('should call deleteTokens on cache port', async () => {
    deleteTokensCachePort.deleteTokens.mockResolvedValue(true);

    const result = await adapter.deleteTokens();

    expect(result).toBe(true);
    expect(deleteTokensCachePort.deleteTokens).toHaveBeenCalledTimes(1);
  });

  it('should return false when cache port returns false', async () => {
    deleteTokensCachePort.deleteTokens.mockResolvedValue(false);

    const result = await adapter.deleteTokens();

    expect(result).toBe(false);
    expect(deleteTokensCachePort.deleteTokens).toHaveBeenCalledTimes(1);
  });
});
