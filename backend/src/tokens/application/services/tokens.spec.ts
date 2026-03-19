import { TokenPair } from 'src/tokens/domain/models/token-pair.model';
import { TokenService } from './tokens.service';
import { ReadTokensFromRepoPort } from '../ports/out/read-tokens-from-repo.port';
import { RefreshTokensPort } from '../ports/out/refresh-tokens.port';
import { WriteTokensRepoPort } from '../ports/out/write-tokens-repo.port';

describe('TokenService', () => {
  let service: TokenService;
  let readTokenFromRepo: jest.Mocked<ReadTokensFromRepoPort>;
  let refreshTokens: jest.Mocked<RefreshTokensPort>;
  let writeTokens: jest.Mocked<WriteTokensRepoPort>;

  beforeEach(() => {
    readTokenFromRepo = {
      readTokens: jest.fn(),
    };

    refreshTokens = {
      refreshTokens: jest.fn(),
    };

    writeTokens = {
      writeTokens: jest.fn(),
    }

    service = new TokenService(writeTokens, readTokenFromRepo, refreshTokens);
  });

  it('should fetch tokens from repo and return them', async () => {

    const validToken = new TokenPair('access_token_1', 'refresh_token_1', new Date(Date.now() + 20000));
    const apiReturnedToken = new TokenPair('access_token_2', 'refresh_token_2', new Date(Date.now()))

    readTokenFromRepo.readTokens.mockResolvedValue(validToken);
    refreshTokens.refreshTokens.mockResolvedValue(apiReturnedToken);

    const returnedValue = await service.getValidToken();

    expect(readTokenFromRepo.readTokens).toHaveBeenCalledTimes(1);
    expect(refreshTokens.refreshTokens).toHaveBeenCalledTimes(0);
    expect(returnedValue).toBe(validToken.getAccessToken());
  });

  it('should fetch tokens from repo, found them invalid and refresh new tokens', async () => {

    const validToken = new TokenPair('access_token_1', 'refresh_token_1', new Date(Date.now()));
    const apiReturnedToken = new TokenPair('access_token_2', 'refresh_token_2', new Date(Date.now() + 30000))

    readTokenFromRepo.readTokens.mockResolvedValue(validToken);
    refreshTokens.refreshTokens.mockResolvedValue(apiReturnedToken);

    const returnedValue = await service.getValidToken();

    expect(writeTokens.writeTokens).toHaveBeenCalledTimes(1);
    expect(readTokenFromRepo.readTokens).toHaveBeenCalledTimes(1);
    expect(refreshTokens.refreshTokens).toHaveBeenCalledTimes(1);
    expect(writeTokens.writeTokens).toHaveBeenCalledTimes(1);
    expect(returnedValue).toBe(apiReturnedToken.getAccessToken());
  });
});