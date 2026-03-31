import { GetTokensFromApiPort } from 'src/api-auth-vimar/application/repository/get-tokens-from-api.port';
import { GetTokenWithCodeAdapter } from './get-tokens-with-code.adapter';
import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';

describe('GetTokensWithCodeAdapter', () => {
  let getTokensWithCode: GetTokenWithCodeAdapter;
  let getTokensFromApiPort: jest.Mocked<GetTokensFromApiPort>;
  let takenTokens: TokensDto;
  let returnedTokens: TokenPair;

  beforeEach(() => {
    takenTokens = {
      accessToken: 'access_token_1',
      refreshToken: 'refresh_token_1',
      expiresIn: 600,
    };

    getTokensFromApiPort = {
      getTokensWithCode: jest.fn(),
    };

    getTokensWithCode = new GetTokenWithCodeAdapter(getTokensFromApiPort);
  });

  it('given the auth code should return the fetched tokens', async () => {
    getTokensFromApiPort.getTokensWithCode.mockResolvedValue(takenTokens);
    const tokens = await getTokensWithCode.getTokensWithCode('my-code');
    returnedTokens = new TokenPair(
      'access_token_1',
      'refresh_token_1',
      new Date(Date.now() + 600 * 1000),
    );

    expect(getTokensFromApiPort.getTokensWithCode).toHaveBeenCalledTimes(1);
    expect(getTokensFromApiPort.getTokensWithCode).toHaveBeenCalledWith(
      'my-code',
    );
    expect(tokens).toEqual(returnedTokens);
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
