import { TokenPair } from "src/tokens/domain/models/token-pair.model";

export interface GetTokensWithCodePort {
    getTokensWithCode(code: string): Promise <TokenPair>;
}

export const GETTOKENSWITHCODEPORT = Symbol('GetTokensWithCodePort');
