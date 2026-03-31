import { HttpService } from '@nestjs/axios';
import { GetTokensFromApiImpl } from './get-tokens-from-api.impl';
import { Observable, of } from 'rxjs';
import { TokensDto } from '../dto/tokens.dto';

describe('GetTokensFromApiImpl', () => {
  let apiImpl: GetTokensFromApiImpl;
  let httpService: jest.Mocked<Pick<HttpService, 'post'>>;

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

    process.env.CLIENTID = 'my-client-id';
    process.env.CLIENTSECRET = 'my-client-secret';
    process.env.HOST2 = 'https://auth.example.com/token';
    process.env.REDIRECT_URI = 'http://localhost:3000/callback';

    apiImpl = new GetTokensFromApiImpl(
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
      delete process.env.CLIENTID;
      delete process.env.CLIENTSECRET;
      delete process.env.HOST2;
      delete process.env.REDIRECT_URI;

      const apiWithEmptyConfig = new GetTokensFromApiImpl(
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
      delete process.env.HOST2;

      const apiWithMissingTokenUrl = new GetTokensFromApiImpl(
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
