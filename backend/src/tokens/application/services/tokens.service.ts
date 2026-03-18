import { Inject, Injectable } from "@nestjs/common";
import { GetValidTokenPort} from "src/tokens/application/ports/out/get-valid-token.port";
import { type ReadTokensFromRepoPort, READTOKENSFROMREPOPORT } from "../ports/out/read-tokens-from-repo.port";
import { type RefreshTokensPort, REFRESHTOKENSPORT } from "../ports/out/refresh-tokens.port";
import { TokenPair } from "src/tokens/domain/models/token-pair.model";


@Injectable()
export class TokenService implements GetValidTokenPort {    
    constructor(
        @Inject(READTOKENSFROMREPOPORT) private readonly readTokensFromRepo: ReadTokensFromRepoPort,
        @Inject(REFRESHTOKENSPORT) private readonly refreshTokens: RefreshTokensPort
    ) {}

    async getValidToken(): Promise<string> {
        try{
            const tokens: TokenPair = await this.readTokensFromRepo.readTokens();
    
            if(tokens.getExpiresAt() < new Date(Date.now() + 10000)) {
                await this.refreshTokens.refreshTokens(tokens.getRefreshToken());
            }

            return tokens.getAccessToken();

        } catch(err) {
            throw(err);
        }
    }
}
