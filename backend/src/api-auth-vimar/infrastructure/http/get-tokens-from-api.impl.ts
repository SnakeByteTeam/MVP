import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { GetTokensFromApiPort } from 'src/api-auth-vimar/application/repository/get-tokens-from-api.port';
import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';
import { RefreshTokensFromApiPort } from 'src/api-auth-vimar/application/repository/refresh-tokens-from-api.port';

@Injectable()
export class GetTokensFromApiImpl
  implements GetTokensFromApiPort, RefreshTokensFromApiPort
{
  private readonly logger = new Logger(GetTokensFromApiImpl.name);

  constructor(private readonly httpService: HttpService) {}

  private readonly clientId = process.env.CLIENTID || process.env.CLIENT_ID;
  private readonly clientSecret =
    process.env.CLIENTSECRET || process.env.CLIENT_SECRET;
  private readonly tokenUrl = process.env.HOST2 || process.env.OAUTH_TOKEN_URL;
  private readonly redirectUrl =
    process.env.REDIRECT_URI || process.env.OAUTH_REDIRECT_URI;

  async getTokensWithCode(code: string): Promise<TokensDto | null> {
    this.logger.log(`Getting tokens with code: ${code}`);
    this.logger.log(`Token URL: ${this.tokenUrl}`);
    this.logger.log(`Client ID: ${this.clientId}`);
    this.logger.log(`Redirect URI: ${this.redirectUrl}`);

    const basicAuth =
      'Basic ' +
      Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirectUrl || '',
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.tokenUrl || '', data.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: basicAuth,
          },
        }),
      );

      this.logger.log('Tokens received successfully');

      const tokensDto: TokensDto = {
        accessToken: response.data?.access_token,
        refreshToken: response.data?.refresh_token,
        expiresIn: response.data?.expires_in,
      };

      return tokensDto;
    } catch (error) {
      this.logger.error(`Error getting tokens: ${error.message}`, error);
      return null;
    }
  }

  async refresh(refreshToken: string): Promise<TokensDto | null> {
    const basicAuth =
      'Basic ' +
      Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.tokenUrl || '', data.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: basicAuth,
          },
        }),
      );

      const tokensDto: TokensDto = {
        accessToken: response.data?.access_token,
        refreshToken: response.data?.refresh_token,
        expiresIn: response.data?.expires_in,
      };

      return tokensDto;
    } catch {
      return null;
    }
  }
}
