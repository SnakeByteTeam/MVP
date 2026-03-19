import { Injectable, Inject } from "@nestjs/common";
import { type RefreshTokensFromApiPort, REFRESHTOKENSFROMAPIPORT } from "src/tokens/application/ports/out/refresh-tokens-from-api.port";
import { RefreshTokensPort } from "src/tokens/application/ports/out/refresh-tokens.port";
import { TokenPair } from "src/tokens/domain/models/token-pair.model";
import { TokensDto } from "src/tokens/infrastructure/dtos/tokens.dto";

@Injectable()
export class RefreshTokensAdapter implements RefreshTokensPort {
    constructor(
        @Inject(REFRESHTOKENSFROMAPIPORT) private refreshTokensFromApi: RefreshTokensFromApiPort
    ) {}

    async refreshTokens(refreshToken: string): Promise<TokenPair | null> {
        try{    
            const tokens: TokensDto | null = await this.refreshTokensFromApi.refresh(refreshToken);
            
            if(!tokens) return null;

            const expiresAt: Date = new Date(Date.now() + tokens.expiresIn * 1000);
            return new TokenPair(tokens.accessToken, tokens.refreshToken, expiresAt);
        }   
        catch (err) {
            throw (err);
        }
    }
}