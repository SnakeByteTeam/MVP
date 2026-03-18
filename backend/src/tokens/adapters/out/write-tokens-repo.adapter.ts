import { Inject, Injectable } from "@nestjs/common";
import { WriteTokensCachePort, WRITETOKENSCACHEPORT } from "src/tokens/application/ports/out/write-tokens-cache.port";
import { WriteTokensRepoPort } from "src/tokens/application/ports/out/write-tokens-repo.port";
import { TokenPair } from "src/tokens/domain/models/token-pair.model";

@Injectable()
export class WriteTokensRepoAdapter implements WriteTokensRepoPort {
    constructor(
        @Inject(WRITETOKENSCACHEPORT) private readonly writeTokensCachePort: WriteTokensCachePort
    ) {}

    async writeTokens(tokens: TokenPair): Promise<boolean> {
        const accessToken = tokens.getAccessToken();
        const refreshToken = tokens.getRefreshToken();
        const expiresAt = tokens.getExpiresAt();

        return await this.writeTokensCachePort.writeTokens(accessToken, refreshToken, expiresAt);
    }
}