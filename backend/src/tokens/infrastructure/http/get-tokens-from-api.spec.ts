import { HttpService } from '@nestjs/axios';
import { GetTokensFromApiImpl } from './get-tokens-from-api.impl';
import { ConfigService } from '@nestjs/config';
import { Observable, of } from 'rxjs';
import { TokensDto } from '../dtos/tokens.dto';


describe('TokenCacheImpl', () => {
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
            }
        })
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
        httpService as unknown as HttpService);
  });

  //Test Get Tokens With Code
  it('should return tokens when api call succeeds', async () => {

    const tokens: TokensDto = {
        accessToken: 'access_token', 
        refreshToken: 'refresh_token', 
        expiresIn: 600
    }

    const result = await apiImpl.getTokensWithCode('my-code');

    expect(result).toEqual(tokens);
 });

 it('should call the api with correct params', async () => {
    await apiImpl.getTokensWithCode('my-code');

    const expectedAuth = "Basic " + Buffer.from(`my-client-id:my-client-secret`).toString("base64");

    const data = new URLSearchParams({
        grant_type: "authorization_code",
        code: 'my-code',
        redirect_uri: 'http://localhost:3000/callback',
    });

    expect(httpService.post).toHaveBeenCalledWith(
        'https://auth.example.com/token',
        expect.stringContaining(data.toString()),
        expect.objectContaining({
        headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expectedAuth
        }),
        })
    );
 });

 it('should return null when api call fails', async () => {
    httpService.post.mockReturnValue(
        new Observable(observer => observer.error(new Error('Network error')))
    );

    const result = await apiImpl.getTokensWithCode('my-code');

    expect(result).toBeNull();
 });


//Test Get Tokens With Refresh Token
 it('should refresh token when api calls succeed', async () => {
    const tokens: TokensDto = {
        accessToken: 'access_token', 
        refreshToken: 'refresh_token', 
        expiresIn: 600
    }

    const result = await apiImpl.refresh('my-refresh-token');

    expect(result).toEqual(tokens);
 });

 it('should call api for refresh with the rights parameters', async () =>{
    await apiImpl.refresh('my-refresh-token');

    const expectedAuth = "Basic " + Buffer.from(`my-client-id:my-client-secret`).toString("base64");

    const data = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: 'my-refresh-token',
    });

    expect(httpService.post).toHaveBeenCalledWith(
        'https://auth.example.com/token',
        expect.stringContaining(data.toString()),
        expect.objectContaining({
        headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expectedAuth
        }),
        })
    );
 });

 it('should return null when api call fails', async () => {
    httpService.post.mockReturnValue(
        new Observable(observer => observer.error(new Error('Network error')))
    );

    const result = await apiImpl.refresh('my-refresh-token');

    expect(result).toBeNull();
 });




});