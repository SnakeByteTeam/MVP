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
import { GetAccountStatusUseCase } from '../ports/in/get-account-status.usecase';

@Injectable()
export class ApiAuthTokensService implements GetTokensCallbackUseCase {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(GETTOKENSWITHCODEPORT)
    private readonly getTokensWithCodePort: GetTokensWithCodePort,
    @Inject(WRITETOKENSREPOPORT)
    private readonly writeTokensRepoPort: WriteTokensRepoPort,
  ) {}

  async getTokens(code: string, userId: number) {
    const { tokenPair, email } =
      await this.getTokensWithCodePort.getTokensWithCode(code);

    console.log(`Received tokens for user ${userId} with email ${email}`); // Log per debug

    const persisted = await this.writeTokensRepoPort.writeTokens(
      tokenPair,
      userId,
      email,
    );
    if (!persisted) {
      throw new Error('Unable to persist OAuth tokens in cache');
    } else {
      this.eventEmitter.emit('fetched.tokens');
    }
  }
}
