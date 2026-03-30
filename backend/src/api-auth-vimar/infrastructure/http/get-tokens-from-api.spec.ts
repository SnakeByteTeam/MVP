import { HttpService } from '@nestjs/axios';
import { GetTokensFromApiImpl } from './get-tokens-from-api.impl';
import { ConfigService } from '@nestjs/config';
import { Observable, of } from 'rxjs';
import { TokensDto } from '../dto/tokens.dto';

describe('GetTokensFromApiImpl', () => {
  let apiImpl: GetTokensFromApiImpl;
  let httpService: jest.Mocked<Pick<HttpService, 'post'>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  beforeEach(() => {
    httpService = {
      post: jest.fn().mockReturnValue(
        of({
          data: {
            access_token: 'access_token',
            refresh_token: 'refresh_token',
            expires_in: 600,
          },
        }),
      ),
    };

    const cfg: Record<string, string> = {
      clientId: 'my-client-id',
      clientSecret: 'my-client-secret',
      host2: 'https://auth.example.com/token',
      redirectUrl: 'http://localhost:3000/callback',
    };

    configService = {
      get: jest.fn((key: string) => cfg[key]),
    };

    apiImpl = new GetTokensFromApiImpl(
      configService as unknown as ConfigService,
      httpService as unknown as HttpService,
    );
  });

  describe('getTokensWithCode', () => {
    it('should return tokens when api call succeeds', async () => {
      const tokens: TokensDto = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        expiresIn: 600,
      };

      const result = await apiImpl.getTokensWithCode('my-code');

      expect(result).toEqual(tokens);
    });

    it('should call the api with correct params', async () => {
      await apiImpl.getTokensWithCode('my-code');

      const expectedAuth =
        'Basic ' +
        Buffer.from(`my-client-id:my-client-secret`).toString('base64');

      const data = new URLSearchParams({
        grant_type: 'authorization_code',
        code: 'my-code',
        redirect_uri: 'http://localhost:3000/callback',
      });

      expect(httpService.post).toHaveBeenCalledWith(
        'https://auth.example.com/token',
        expect.stringContaining(data.toString()),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expectedAuth,
          }),
        }),
      );
    });

    it('should fallback to empty token and redirect urls when config values are missing', async () => {
      const emptyConfigService: jest.Mocked<Partial<ConfigService>> = {
        get: jest.fn(() => undefined),
      };
      const apiWithEmptyConfig = new GetTokensFromApiImpl(
        emptyConfigService as unknown as ConfigService,
        httpService as unknown as HttpService,
      );

      await apiWithEmptyConfig.getTokensWithCode('my-code');

      expect(httpService.post).toHaveBeenCalledWith(
        '',
        expect.stringContaining('redirect_uri='),
        expect.any(Object),
      );
    });

    it('should return null when api call fails', async () => {
      httpService.post.mockReturnValue(
        new Observable((observer) =>
          observer.error(new Error('Network error')),
        ),
      );

      const result = await apiImpl.getTokensWithCode('my-code');

      expect(result).toBeNull();
    });
  });

  describe('refresh', () => {
    it('should refresh token when api calls succeed', async () => {
      const tokens: TokensDto = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        expiresIn: 600,
      };

      const result = await apiImpl.refresh('my-refresh-token');

      expect(result).toEqual(tokens);
    });

    it('should call api for refresh with the right parameters', async () => {
      await apiImpl.refresh('my-refresh-token');

      const expectedAuth =
        'Basic ' +
        Buffer.from(`my-client-id:my-client-secret`).toString('base64');

      const data = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: 'my-refresh-token',
      });

      expect(httpService.post).toHaveBeenCalledWith(
        'https://auth.example.com/token',
        expect.stringContaining(data.toString()),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expectedAuth,
          }),
        }),
      );
    });

    it('should fallback to empty token url when config value is missing', async () => {
      const cfg: Record<string, string | undefined> = {
        clientId: 'my-client-id',
        clientSecret: 'my-client-secret',
        host2: undefined,
        redirectUrl: 'http://localhost:3000/callback',
      };
      const missingTokenUrlConfig: jest.Mocked<Partial<ConfigService>> = {
        get: jest.fn((key: string) => cfg[key]),
      };
      const apiWithMissingTokenUrl = new GetTokensFromApiImpl(
        missingTokenUrlConfig as unknown as ConfigService,
        httpService as unknown as HttpService,
      );

      await apiWithMissingTokenUrl.refresh('my-refresh-token');

      expect(httpService.post).toHaveBeenCalledWith(
        '',
        expect.stringContaining('grant_type=refresh_token'),
        expect.any(Object),
      );
    });

    it('should return null when api call fails', async () => {
      httpService.post.mockReturnValue(
        new Observable((observer) =>
          observer.error(new Error('Network error')),
        ),
      );

      const result = await apiImpl.refresh('my-refresh-token');

      expect(result).toBeNull();
    });
  });
});
