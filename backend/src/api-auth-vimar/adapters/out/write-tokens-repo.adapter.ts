import { Inject, Injectable } from '@nestjs/common';
import {
  WriteTokensCachePort,
  WRITETOKENSCACHEPORT,
} from 'src/api-auth-vimar/application/repository/write-tokens-cache.port';
import {
  ReadTokensCachePort,
  READTOKENSCACHEPORT,
} from 'src/api-auth-vimar/application/repository/read-tokens-cache.port';
import { WriteTokensRepoPort } from 'src/api-auth-vimar/application/ports/out/write-tokens-repo.port';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';

@Injectable()
export class WriteTokensRepoAdapter implements WriteTokensRepoPort {
  constructor(
    @Inject(WRITETOKENSCACHEPORT)
    private readonly writeTokensCachePort: WriteTokensCachePort,
    @Inject(READTOKENSCACHEPORT)
    private readonly readTokensCachePort: ReadTokensCachePort,
  ) {}

  async writeTokens(
    tokens: TokenPair,
    userId?: number,
    email?: string,
  ): Promise<boolean> {
    const accessToken = tokens.getAccessToken();
    const refreshToken = tokens.getRefreshToken();
    const expiresAt = tokens.getExpiresAt();

    let resolvedUserId = userId;
    let resolvedEmail = email;

    if (resolvedUserId === undefined || resolvedEmail === undefined) {
      const cachedTokens = await this.readTokensCachePort.readTokens();
      if (!cachedTokens) {
        throw new Error('Missing user metadata to persist refreshed tokens');
      }

      resolvedUserId ??= cachedTokens.userId;
      resolvedEmail ??= cachedTokens.email;
    }

    return await this.writeTokensCachePort.writeTokens(
      accessToken,
      refreshToken,
      expiresAt,
      resolvedUserId,
      resolvedEmail,
    );
  }
}
