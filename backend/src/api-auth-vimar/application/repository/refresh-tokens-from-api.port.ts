import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';

export interface RefreshTokensFromApiPort {
  refresh(refreshToken: string): Promise<TokensDto | null>;
}

export const REFRESHTOKENSFROMAPIPORT = Symbol('RefreshTokensFromApiPort');
