import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';

export interface GetTokensFromApiPort {
  getTokensWithCode(code: string): Promise<TokensDto | null>;
}

export const GETTOKENSFROMAPIPORT = Symbol('GetTokensFromApiPort');
