import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { GetTokensFromApiPort } from 'src/tokens/application/repository/get-tokens-from-api.port';
import { TokensDto } from 'src/tokens/infrastructure/dtos/tokens.dto';
import { RefreshTokensFromApiPort } from 'src/tokens/application/repository/refresh-tokens-from-api.port';

@Injectable()
export class GetTokensFromApiImpl
  implements GetTokensFromApiPort, RefreshTokensFromApiPort
{
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private readonly clientId = this.configService.get<string>('clientId');
  private readonly clientSecret =
    this.configService.get<string>('clientSecret');
  private readonly tokenUrl = this.configService.get<string>('host2');
  private readonly redirectUrl = this.configService.get<string>('redirectUrl');

  async getTokensWithCode(code: string): Promise<TokensDto | null> {
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

      const tokensDto: TokensDto = {
        accessToken: response.data?.access_token,
        refreshToken: response.data?.refresh_token,
        expiresIn: response.data?.expires_in,
      };

      return tokensDto;
    } catch (err) {
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
    } catch (err) {
      return null;
    }
  }
}
