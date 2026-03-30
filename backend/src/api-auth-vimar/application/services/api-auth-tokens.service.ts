import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GetTokensCallbackUseCase } from '../ports/in/get-tokens.usecase';
import {
  type GetTokensWithCodePort,
  GETTOKENSWITHCODEPORT,
} from '../ports/out/get-tokens-with-code.port';
import {
  type WriteTokensRepoPort,
  WRITETOKENSREPOPORT,
} from '../ports/out/write-tokens-repo.port';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';

@Injectable()
export class ApiAuthTokensService implements GetTokensCallbackUseCase {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(GETTOKENSWITHCODEPORT)
    private readonly getTokensWithCodePort: GetTokensWithCodePort,
    @Inject(WRITETOKENSREPOPORT)
    private readonly writeTokensRepoPort: WriteTokensRepoPort,
  ) {}

  async getTokens(code: string) {
    const tokens: TokenPair =
      await this.getTokensWithCodePort.getTokensWithCode(code);

    await this.writeTokensRepoPort.writeTokens(tokens);

    this.eventEmitter.emit('fetched.tokens');
  }
}
