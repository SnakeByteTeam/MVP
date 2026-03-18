import { Injectable, Inject } from "@nestjs/common";
import { type GetTokensWithCodePort, GETTOKENSWITHCODEPORT } from "src/tokens/application/ports/out/get-tokens-with-code.port";
import { TokenPair } from "src/tokens/domain/models/token-pair.model";
import { TokensDto } from "src/tokens/infrastructure/dtos/tokens.dto";
import { GETTOKENSFROMAPIPORT, type GetTokensFromApiPort } from "src/tokens/application/ports/out/get-tokens-from-api.port";

@Injectable()
export class GetTokenWithCodeAdapter implements GetTokensWithCodePort {
    constructor(
        @Inject(GETTOKENSFROMAPIPORT) private readonly getTokensFromApiPort: GetTokensFromApiPort
    ) {}

    async getTokensWithCode(code: string): Promise<TokenPair> {
        const tokensDto: TokensDto = await this.getTokensFromApiPort.getTokensWithCode(code);

        const expiresAt: Date = new Date(Date.now() + tokensDto.expiresIn * 1000);

        return new TokenPair(tokensDto.accessToken, tokensDto.refreshToken, expiresAt);  
    }
}