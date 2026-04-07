import { GetTokensFromApiPort } from 'src/api-auth-vimar/application/repository/get-tokens-from-api.port';
import { GetTokenWithCodeAdapter } from './get-tokens-with-code.adapter';
import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';

describe('GetTokensWithCodeAdapter', () => {
  let getTokensWithCode: GetTokenWithCodeAdapter;
  let getTokensFromApiPort: jest.Mocked<GetTokensFromApiPort>;
  let takenTokens: TokensDto;

  beforeEach(() => {
    takenTokens = {
      accessToken: 'access_token_1',
      refreshToken: 'refresh_token_1',
      expiresIn: 600,
      email: 'utente@example.com',
    };

    getTokensFromApiPort = {
      getTokensWithCode: jest.fn(),
    };

    getTokensWithCode = new GetTokenWithCodeAdapter(getTokensFromApiPort);
  });

  it('given the auth code should return the fetched tokens', async () => {
    const now = Date.now();
    getTokensFromApiPort.getTokensWithCode.mockResolvedValue(takenTokens);
    const tokens = await getTokensWithCode.getTokensWithCode('my-code');

    expect(getTokensFromApiPort.getTokensWithCode).toHaveBeenCalledTimes(1);
    expect(getTokensFromApiPort.getTokensWithCode).toHaveBeenCalledWith(
      'my-code',
    );
    expect(tokens.tokenPair.getAccessToken()).toBe('access_token_1');
    expect(tokens.tokenPair.getRefreshToken()).toBe('refresh_token_1');
    expect(tokens.email).toBe('utente@example.com');

    const expiresAt = tokens.tokenPair.getExpiresAt().getTime();
    const expected = now + 600 * 1000;
    expect(expiresAt).toBeGreaterThanOrEqual(expected - 1000);
    expect(expiresAt).toBeLessThanOrEqual(expected + 1000);
  });

  it('given the auth code should throw an error when fetching null tokens', async () => {
    getTokensFromApiPort.getTokensWithCode.mockResolvedValue(null);

    await expect(
      getTokensWithCode.getTokensWithCode('my-code'),
    ).rejects.toThrow();

    expect(getTokensFromApiPort.getTokensWithCode).toHaveBeenCalledTimes(1);
    expect(getTokensFromApiPort.getTokensWithCode).toHaveBeenCalledWith(
      'my-code',
    );
  });
});
