import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { GetTokensFromApiPort } from 'src/api-auth-vimar/application/repository/get-tokens-from-api.port';
import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';
import { RefreshTokensFromApiPort } from 'src/api-auth-vimar/application/repository/refresh-tokens-from-api.port';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GetTokensFromApiImpl
  implements GetTokensFromApiPort, RefreshTokensFromApiPort
{
  private readonly logger = new Logger(GetTokensFromApiImpl.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService
  ) {}

  private readonly clientId = process.env.CLIENTID || process.env.CLIENT_ID;
  private readonly clientSecret =
    process.env.CLIENTSECRET || process.env.CLIENT_SECRET;
  private readonly tokenUrl = process.env.HOST2 || process.env.OAUTH_TOKEN_URL;
  private readonly redirectUrl =
    process.env.REDIRECT_URI || process.env.OAUTH_REDIRECT_URI;

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

      const accessToken = response.data?.access_token;
      const email = this.extractEmailFromAccessToken(accessToken);
      
      const tokensDto: TokensDto = {
        accessToken,
        refreshToken: response.data?.refresh_token,
        expiresIn: response.data?.expires_in,
        email,
      };

      return tokensDto;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting tokens: ${message}`, stack);
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

      const accessToken = response.data?.access_token;
      const email = this.extractEmailFromAccessToken(accessToken);

      const tokensDto: TokensDto = {
        accessToken,
        refreshToken: response.data?.refresh_token,
        expiresIn: response.data?.expires_in,
        email,
      };

      return tokensDto;
    } catch {
      return null;
    }
  }

  private extractEmailFromAccessToken(accessToken: unknown): string {
    if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
      throw new Error('Access token is missing');
    }

    const decoded = this.jwtService.decode(accessToken);
    if (!decoded || typeof decoded !== 'object') {
      throw new Error('Unable to decode access token');
    }

    const claims = decoded as {
      email?: unknown;
      preferred_username?: unknown;
      upn?: unknown;
      username?: unknown;
    };

    const email =
      claims.email ??
      claims.preferred_username ??
      claims.upn ??
      claims.username;

    if (typeof email !== 'string' || email.trim().length === 0) {
      const availableClaims = Object.keys(decoded as Record<string, unknown>)
        .slice(0, 20)
        .join(', ');
      throw new Error(
        `Email claim is missing in access token. Claims available: ${availableClaims}`,
      );
    }

    return email;
  }
}
