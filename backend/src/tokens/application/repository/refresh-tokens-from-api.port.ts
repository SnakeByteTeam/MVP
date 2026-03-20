import { TokensDto } from "src/tokens/infrastructure/dtos/tokens.dto";

export interface RefreshTokensFromApiPort {
    refresh(refreshToken: string): Promise<TokensDto | null>;
}

export const REFRESHTOKENSFROMAPIPORT = Symbol('RefreshTokensFromApiPort');