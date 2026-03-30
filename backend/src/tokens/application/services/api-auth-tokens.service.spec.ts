import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiAuthTokensService } from './api-auth-tokens.service';
import { TokenPair } from 'src/tokens/domain/models/token-pair.model';
import { GetTokensWithCodePort } from '../ports/out/get-tokens-with-code.port';
import { WriteTokensRepoPort } from '../ports/out/write-tokens-repo.port';

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
    getTokensWithCodePort.getTokensWithCode.mockResolvedValue(tokens);
    writeTokensRepoPort.writeTokens.mockResolvedValue(true);

    await service.getTokens('auth-code');

    expect(getTokensWithCodePort.getTokensWithCode).toHaveBeenCalledWith(
      'auth-code',
    );
    expect(getTokensWithCodePort.getTokensWithCode).toHaveBeenCalledTimes(1);
    expect(writeTokensRepoPort.writeTokens).toHaveBeenCalledWith(tokens);
    expect(writeTokensRepoPort.writeTokens).toHaveBeenCalledTimes(1);
  });
});
