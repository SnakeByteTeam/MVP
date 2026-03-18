import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

import { GetTokensFromApiPort } from "src/tokens/application/ports/out/get-tokens-from-api.port";
import { TokensDto } from "src/tokens/infrastructure/dtos/tokens.dto";

@Injectable()
export class GetTokensFromApiImpl implements GetTokensFromApiPort {

    constructor(
        private readonly httpService: HttpService,
    ) {}

    async getTokensWithCode(code: string): Promise<TokensDto> {
        const basicAuth =   "Basic " + Buffer.from(`${process.env.CLIENTID}:${process.env.CLIENTSECRET}`).toString("base64");

        const data = new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: process.env.REDIRECT_URI || "http://localhost:3000/tokens/callback",
        });

        const response = await firstValueFrom(
            this.httpService.post(process.env.HOST2 || "", data.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', 
                    Authorization: basicAuth
                }
            })
        );

        const tokensDto: TokensDto = {
            accessToken: response.data?.access_token,
            refreshToken: response.data?.refresh_token,
            expiresIn: response.data?.expires_in
        };

        return tokensDto;
    }
}