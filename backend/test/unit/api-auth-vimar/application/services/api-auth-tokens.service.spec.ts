import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiAuthTokensService } from 'src/api-auth-vimar/application/services/api-auth-tokens.service';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';
import { GetTokensWithCodePort } from 'src/api-auth-vimar/application/ports/out/get-tokens-with-code.port';
import { WriteTokensRepoPort } from 'src/api-auth-vimar/application/ports/out/write-tokens-repo.port';

describe('ApiAuthTokensService', () => {
  let service: ApiAuthTokensService;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let getTokensWithCodePort: jest.Mocked<GetTokensWithCodePort>;
  let writeTokensRepoPort: jest.Mocked<WriteTokensRepoPort>;

  beforeEach(() => {
    eventEmitter = {
      emit: jest.fn(),
    } as any;

    getTokensWithCodePort = {
      getTokensWithCode: jest.fn(),
    };

    writeTokensRepoPort = {
      writeTokens: jest.fn(),
    };

    service = new ApiAuthTokensService(
      eventEmitter,
      getTokensWithCodePort,
      writeTokensRepoPort,
    );
  });

  it('should fetch tokens with code and persist them', async () => {
    const tokens = new TokenPair(
      'access-token',
      'refresh-token',
      new Date('2030-01-01T00:00:00.000Z'),
    );
    getTokensWithCodePort.getTokensWithCode.mockResolvedValue({
      tokenPair: tokens,
      email: 'utente@example.com',
    });
    writeTokensRepoPort.writeTokens.mockResolvedValue(true);

    await service.getTokens('auth-code', 42);

    expect(getTokensWithCodePort.getTokensWithCode).toHaveBeenCalledWith(
      'auth-code',
    );
    expect(getTokensWithCodePort.getTokensWithCode).toHaveBeenCalledTimes(1);
    expect(writeTokensRepoPort.writeTokens).toHaveBeenCalledWith(
      tokens,
      42,
      'utente@example.com',
    );
    expect(writeTokensRepoPort.writeTokens).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith('fetched.tokens');
  });

  it('should throw when token persistence fails', async () => {
    const tokens = new TokenPair(
      'access-token',
      'refresh-token',
      new Date('2030-01-01T00:00:00.000Z'),
    );

    getTokensWithCodePort.getTokensWithCode.mockResolvedValue({
      tokenPair: tokens,
      email: 'utente@example.com',
    });
    writeTokensRepoPort.writeTokens.mockResolvedValue(false);

    await expect(service.getTokens('auth-code', 42)).rejects.toThrow(
      'Unable to persist OAuth tokens in cache',
    );
    expect(eventEmitter.emit).toHaveBeenCalledTimes(0);
  });
});
