import { Inject, Injectable } from "@nestjs/common";
import { type ReadTokensCachePort, READTOKENSCACHEPORT } from "src/tokens/application/ports/out/read-tokens-cache.port";
import { ReadTokensFromRepoPort } from "src/tokens/application/ports/out/read-tokens-from-repo.port";
import { TokenPair } from "src/tokens/domain/models/token-pair.model";
import { TokenEntity } from "src/tokens/infrastructure/persistence/entities/tokens.entity";

@Injectable()
export class ReadTokensFromRepoAdapter implements ReadTokensFromRepoPort{
    constructor(
        @Inject(READTOKENSCACHEPORT) private readTokensCachePort: ReadTokensCachePort
    ) {}

    async readTokens(): Promise<TokenPair> {
        try{
            const tokens: TokenEntity | null = await this.readTokensCachePort.readTokens();

            if (!tokens) {
                throw new Error('No tokens found in cache');
            }

            return new TokenPair(tokens.accessToken, tokens.refreshToken, tokens.expiresAt);
        } catch(err) {
            throw(err);
        }
    }
}