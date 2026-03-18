import { TokensDto } from "src/tokens/infrastructure/dtos/tokens.dto";

export interface GetTokensFromApiPort {
    getTokensWithCode(code: string): Promise<TokensDto>;
}

export const GETTOKENSFROMAPIPORT = Symbol('GetTokensFromApiPort');