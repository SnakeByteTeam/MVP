import { TokenPair } from "src/tokens/domain/models/token-pair.model"

export interface ReadTokensFromRepoPort {
    readTokens(): Promise<TokenPair>
}

export const READTOKENSFROMREPOPORT = Symbol("ReadTokensFromRepoPort")

