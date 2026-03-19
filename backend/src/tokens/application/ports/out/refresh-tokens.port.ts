import { TokenPair } from "src/tokens/domain/models/token-pair.model";

export interface RefreshTokensPort {
    refreshTokens(refreshToken: string): Promise<TokenPair | null>
}

export const REFRESHTOKENSPORT = Symbol('RefreshTokensPort');