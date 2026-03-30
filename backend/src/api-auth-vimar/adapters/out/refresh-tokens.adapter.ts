import { Injectable, Inject } from '@nestjs/common';
import {
  type RefreshTokensFromApiPort,
  REFRESHTOKENSFROMAPIPORT,
} from 'src/api-auth-vimar/application/repository/refresh-tokens-from-api.port';
import { RefreshTokensPort } from 'src/api-auth-vimar/application/ports/out/refresh-tokens.port';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';
import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';

@Injectable()
export class RefreshTokensAdapter implements RefreshTokensPort {
  constructor(
    @Inject(REFRESHTOKENSFROMAPIPORT)
    private readonly refreshTokensFromApi: RefreshTokensFromApiPort,
  ) {}

  async refreshTokens(refreshToken: string): Promise<TokenPair | null> {
    const tokens: TokensDto | null =
      await this.refreshTokensFromApi.refresh(refreshToken);

    if (!tokens) throw new Error('Problem requesting tokens to API');

    const expiresAt: Date = new Date(Date.now() + tokens.expiresIn * 1000);

    return new TokenPair(tokens.accessToken, tokens.refreshToken, expiresAt);
  }
}
