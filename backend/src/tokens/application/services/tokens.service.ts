import { Inject, Injectable } from "@nestjs/common";
import { GetValidTokenPort} from "src/tokens/application/ports/out/get-valid-token.port";
import { type ReadTokensFromRepoPort, READTOKENSFROMREPOPORT } from "../ports/out/read-tokens-from-repo.port";
import { type RefreshTokensPort, REFRESHTOKENSPORT } from "../ports/out/refresh-tokens.port";
import { type WriteTokensRepoPort, WRITETOKENSREPOPORT } from "../ports/out/write-tokens-repo.port";
import { TokenPair } from "src/tokens/domain/models/token-pair.model";


@Injectable()
export class TokenService implements GetValidTokenPort {    
    constructor(
        @Inject(WRITETOKENSREPOPORT) private readonly writeTokensOnRepo: WriteTokensRepoPort,
        @Inject(READTOKENSFROMREPOPORT) private readonly readTokensFromRepo: ReadTokensFromRepoPort,
        @Inject(REFRESHTOKENSPORT) private readonly refreshTokens: RefreshTokensPort
    ) {}

    async getValidToken(): Promise<string | null> {
        try{
            let tokens: TokenPair | null = await this.readTokensFromRepo.readTokens();
            if(!tokens) return null;

            if(tokens.getExpiresAt() < new Date(Date.now() + 10000)) {
                tokens =  await this.refreshTokens.refreshTokens(tokens.getRefreshToken());
                if(!tokens) return null;
            }
            await this.writeTokensOnRepo.writeTokens(tokens);
            return tokens.getAccessToken();

        } catch(err) {
            throw(err);
        }
    }
}
