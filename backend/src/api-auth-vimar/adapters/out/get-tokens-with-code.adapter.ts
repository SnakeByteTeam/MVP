import { Injectable, Inject } from '@nestjs/common';
import { type GetTokensWithCodePort } from 'src/api-auth-vimar/application/ports/out/get-tokens-with-code.port';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';
import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';
import {
  GETTOKENSFROMAPIPORT,
  type GetTokensFromApiPort,
} from 'src/api-auth-vimar/application/repository/get-tokens-from-api.port';

@Injectable()
export class GetTokenWithCodeAdapter implements GetTokensWithCodePort {
  constructor(
    @Inject(GETTOKENSFROMAPIPORT)
    private readonly getTokensFromApiPort: GetTokensFromApiPort,
  ) {}

  async getTokensWithCode(code: string): Promise<TokenPair> {
    const tokensDto: TokensDto | null =
      await this.getTokensFromApiPort.getTokensWithCode(code);

    if (!tokensDto) throw new Error('Tokens not found');

    const expiresAt: Date = new Date(Date.now() + tokensDto.expiresIn * 1000);

    return new TokenPair(
      tokensDto.accessToken,
      tokensDto.refreshToken,
      expiresAt,
    );
  }
}
