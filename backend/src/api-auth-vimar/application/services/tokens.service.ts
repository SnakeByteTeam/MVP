import { Inject, Injectable } from '@nestjs/common';
import { GetValidTokenPort } from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import {
  type ReadTokensFromRepoPort,
  READTOKENSFROMREPOPORT,
} from '../ports/out/read-tokens-from-repo.port';
import {
  type RefreshTokensPort,
  REFRESHTOKENSPORT,
} from '../ports/out/refresh-tokens.port';
import {
  type WriteTokensRepoPort,
  WRITETOKENSREPOPORT,
} from '../ports/out/write-tokens-repo.port';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';
import { GetAccountStatusUseCase } from '../ports/in/get-account-status.usecase';
import { READ_STATUS_PORT, type ReadStatusPort } from '../ports/out/read-status.port';

@Injectable()
export class TokenService implements GetValidTokenPort, GetAccountStatusUseCase {
  constructor(
    @Inject(WRITETOKENSREPOPORT)
    private readonly writeTokensOnRepo: WriteTokensRepoPort,
    @Inject(READTOKENSFROMREPOPORT)
    private readonly readTokensFromRepo: ReadTokensFromRepoPort,
    @Inject(REFRESHTOKENSPORT)
    private readonly refreshTokens: RefreshTokensPort,
    @Inject(READ_STATUS_PORT)
    private readonly readStatus: ReadStatusPort,
  ) {}

  async getValidToken(): Promise<string | null> {
    let tokens: TokenPair | null = await this.readTokensFromRepo.readTokens();

    if (tokens.getExpiresAt() < new Date(Date.now() + 10000)) {
      tokens = await this.refreshTokens.refreshTokens(tokens.getRefreshToken());
      if (!tokens) throw new Error("Can't get tokens from API");
    }
    await this.writeTokensOnRepo.writeTokens(tokens);
    return tokens.getAccessToken();
  }

  async getAccountStatus(userId: number): Promise<{ isLinked: boolean, email: string }> {
    let status = await this.readStatus.readStatus(userId);
    
    return status;
  }
}
