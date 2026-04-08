import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';
import { TokenService } from './tokens.service';
import { ReadTokensFromRepoPort } from '../ports/out/read-tokens-from-repo.port';
import { RefreshTokensPort } from '../ports/out/refresh-tokens.port';
import { WriteTokensRepoPort } from '../ports/out/write-tokens-repo.port';
import { ReadStatusPort } from '../ports/out/read-status.port';

describe('TokenService', () => {
  let service: TokenService;
  let readTokenFromRepo: jest.Mocked<ReadTokensFromRepoPort>;
  let refreshTokens: jest.Mocked<RefreshTokensPort>;
  let writeTokens: jest.Mocked<WriteTokensRepoPort>;
  let readStatus: jest.Mocked<ReadStatusPort>;

  beforeEach(() => {
    readTokenFromRepo = {
      readTokens: jest.fn(),
    };

    refreshTokens = {
      refreshTokens: jest.fn(),
    };

    writeTokens = {
      writeTokens: jest.fn(),
    };

    readStatus = {
      readStatus: jest.fn(),
    };

    service = new TokenService(
      writeTokens,
      readTokenFromRepo,
      refreshTokens,
      readStatus,
    );
  });

  it('should fetch tokens from repo and return them', async () => {
    const validToken = new TokenPair(
      'access_token_1',
      'refresh_token_1',
      new Date(Date.now() + 20000),
    );
    const apiReturnedToken = new TokenPair(
      'access_token_2',
      'refresh_token_2',
      new Date(Date.now()),
    );

    readTokenFromRepo.readTokens.mockResolvedValue(validToken);
    refreshTokens.refreshTokens.mockResolvedValue(apiReturnedToken);

    const returnedValue = await service.getValidToken();

    expect(readTokenFromRepo.readTokens).toHaveBeenCalledTimes(1);
    expect(refreshTokens.refreshTokens).toHaveBeenCalledTimes(0);
    expect(returnedValue).toBe(validToken.getAccessToken());
  });

  it('should fetch tokens from repo, found them invalid and refresh new tokens', async () => {
    const notValidToken = new TokenPair(
      'access_token_1',
      'refresh_token_1',
      new Date(Date.now()),
    );
    const apiReturnedToken = new TokenPair(
      'access_token_2',
      'refresh_token_2',
      new Date(Date.now() + 30000),
    );

    readTokenFromRepo.readTokens.mockResolvedValue(notValidToken);
    refreshTokens.refreshTokens.mockResolvedValue(apiReturnedToken);

    const returnedValue = await service.getValidToken();

    expect(readTokenFromRepo.readTokens).toHaveBeenCalledTimes(1);
    expect(refreshTokens.refreshTokens).toHaveBeenCalledTimes(1);
    expect(writeTokens.writeTokens).toHaveBeenCalledTimes(1);
    expect(returnedValue).toBe(apiReturnedToken.getAccessToken());
  });

  it('should throw an error when tokens from API are null', async () => {
    const notValidToken = new TokenPair(
      'access_token_1',
      'refresh_token_1',
      new Date(Date.now()),
    );
    readTokenFromRepo.readTokens.mockResolvedValue(notValidToken);
    refreshTokens.refreshTokens.mockResolvedValue(null);

    await expect(service.getValidToken()).rejects.toThrow();

    expect(readTokenFromRepo.readTokens).toHaveBeenCalledTimes(1);
    expect(refreshTokens.refreshTokens).toHaveBeenCalledTimes(1);
    expect(writeTokens.writeTokens).toHaveBeenCalledTimes(0);
  });

  it('should return account status from read status port', async () => {
    readStatus.readStatus.mockResolvedValue({
      isLinked: true,
      email: 'utente@example.com',
    });

    const result = await service.getAccountStatus(42);

    expect(readStatus.readStatus).toHaveBeenCalledWith(42);
    expect(result).toEqual({
      isLinked: true,
      email: 'utente@example.com',
    });
  });
});
