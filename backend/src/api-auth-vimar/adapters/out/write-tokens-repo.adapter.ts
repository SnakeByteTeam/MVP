import { Inject, Injectable } from '@nestjs/common';
import {
  WriteTokensCachePort,
  WRITETOKENSCACHEPORT,
} from 'src/api-auth-vimar/application/repository/write-tokens-cache.port';
import { WriteTokensRepoPort } from 'src/api-auth-vimar/application/ports/out/write-tokens-repo.port';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';

@Injectable()
export class WriteTokensRepoAdapter implements WriteTokensRepoPort {
  constructor(
    @Inject(WRITETOKENSCACHEPORT)
    private readonly writeTokensCachePort: WriteTokensCachePort,
  ) {}

  async writeTokens(tokens: TokenPair): Promise<boolean> {
    const accessToken = tokens.getAccessToken();
    const refreshToken = tokens.getRefreshToken();
    const expiresAt = tokens.getExpiresAt();

    return await this.writeTokensCachePort.writeTokens(
      accessToken,
      refreshToken,
      expiresAt,
    );
  }
}
