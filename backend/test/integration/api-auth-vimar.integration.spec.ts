import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { ApiAuthVimarModule } from 'src/api-auth-vimar/api-auth-vimar.module';
import { DELETETOKENSCACHEPORT } from 'src/api-auth-vimar/application/repository/delete-tokens-cache.port';
import { DELETEOAUTHTICKETCACHEPORT } from 'src/api-auth-vimar/application/repository/delete-oauth-ticket-cache.port';
import { GETTOKENSFROMAPIPORT } from 'src/api-auth-vimar/application/repository/get-tokens-from-api.port';
import { READOAUTHTICKETCACHEPORT } from 'src/api-auth-vimar/application/repository/read-oauth-ticket-cache.port';
import { READ_STATUS_REPO_PORT } from 'src/api-auth-vimar/application/repository/read-status.repository';
import { READTOKENSCACHEPORT } from 'src/api-auth-vimar/application/repository/read-tokens-cache.port';
import { REFRESHTOKENSFROMAPIPORT } from 'src/api-auth-vimar/application/repository/refresh-tokens-from-api.port';
import { WRITEOAUTHTICKETCACHEPORT } from 'src/api-auth-vimar/application/repository/write-oauth-ticket-cache.port';
import { WRITETOKENSCACHEPORT } from 'src/api-auth-vimar/application/repository/write-tokens-cache.port';

describe('ApiAuthVimar Integration Test', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const ACCESS_SECRET = 'integration-access-secret';

  const mockWriteTokensCache = {
    writeTokens: jest.fn<
      Promise<boolean>,
      [string, string, Date, number, string]
    >(),
  };

  const mockReadTokensCache = {
    readTokens: jest.fn<Promise<any>, []>(),
  };

  const mockDeleteTokensCache = {
    deleteTokens: jest.fn<Promise<boolean>, []>(),
  };

  const mockWriteOAuthTicketCache = {
    writeTicket: jest.fn<Promise<boolean>, [string, number, Date]>(),
  };

  const mockReadOAuthTicketCache = {
    readValidTicket: jest.fn<
      Promise<{ ticket: string; userId: number; expiresAt: Date } | null>,
      [string]
    >(),
  };

  const mockDeleteOAuthTicketCache = {
    deleteTicket: jest.fn<Promise<boolean>, [string]>(),
  };

  const mockGetTokensFromApi = {
    getTokensWithCode: jest.fn<Promise<any>, [string]>(),
  };

  const mockRefreshTokensFromApi = {
    refresh: jest.fn<Promise<any>, [string]>(),
  };

  const mockReadStatusRepo = {
    readStatus: jest.fn<Promise<string | null>, [number]>(),
  };

  beforeEach(async () => {
    process.env.ACCESS_SECRET = ACCESS_SECRET;
    process.env.HOST1 = 'https://vimar.example.com/oauth/authorize';
    process.env.CLIENTID = 'test-client-id';
    process.env.REDIRECT_URI = 'https://frontend.example.com/callback';

    mockWriteTokensCache.writeTokens.mockResolvedValue(true);
    mockReadTokensCache.readTokens.mockResolvedValue({
      accessToken: 'cached-access',
      refreshToken: 'cached-refresh',
      expiresAt: new Date(Date.now() + 60_000),
      userId: 1,
      email: 'linked@example.com',
    });
    mockDeleteTokensCache.deleteTokens.mockResolvedValue(true);
    mockWriteOAuthTicketCache.writeTicket.mockResolvedValue(true);
    mockReadOAuthTicketCache.readValidTicket.mockResolvedValue({
      ticket: 'valid-ticket',
      userId: 1,
      expiresAt: new Date(Date.now() + 30_000),
    });
    mockDeleteOAuthTicketCache.deleteTicket.mockResolvedValue(true);
    mockGetTokensFromApi.getTokensWithCode.mockResolvedValue({
      accessToken: 'api-access-token',
      refreshToken: 'api-refresh-token',
      expiresIn: 3600,
      email: 'linked@example.com',
    });
    mockRefreshTokensFromApi.refresh.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 3600,
      email: 'linked@example.com',
    });
    mockReadStatusRepo.readStatus.mockResolvedValue('linked@example.com');

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), ApiAuthVimarModule],
    })
      .overrideProvider(WRITETOKENSCACHEPORT)
      .useValue(mockWriteTokensCache)
      .overrideProvider(READTOKENSCACHEPORT)
      .useValue(mockReadTokensCache)
      .overrideProvider(DELETETOKENSCACHEPORT)
      .useValue(mockDeleteTokensCache)
      .overrideProvider(WRITEOAUTHTICKETCACHEPORT)
      .useValue(mockWriteOAuthTicketCache)
      .overrideProvider(READOAUTHTICKETCACHEPORT)
      .useValue(mockReadOAuthTicketCache)
      .overrideProvider(DELETEOAUTHTICKETCACHEPORT)
      .useValue(mockDeleteOAuthTicketCache)
      .overrideProvider(GETTOKENSFROMAPIPORT)
      .useValue(mockGetTokensFromApi)
      .overrideProvider(REFRESHTOKENSFROMAPIPORT)
      .useValue(mockRefreshTokensFromApi)
      .overrideProvider(READ_STATUS_REPO_PORT)
      .useValue(mockReadStatusRepo)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = new JwtService({ secret: ACCESS_SECRET });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  const adminToken = () =>
    jwtService.sign({ id: 1, username: 'admin', role: 'AMMINISTRATORE' });

  it('should return MyVimar account status', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/my-vimar/account')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(response.body).toEqual({
      isLinked: true,
      email: 'linked@example.com',
    });
    expect(mockReadStatusRepo.readStatus).toHaveBeenCalledWith(1);
  });

  it('should disconnect MyVimar account', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .delete('/my-vimar/account')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(response.body).toEqual({ success: true });
    expect(mockDeleteTokensCache.deleteTokens).toHaveBeenCalledTimes(1);
  });

  it('should prepare OAuth ticket for authenticated user', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/api/auth/prepare-oauth')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(201);

    expect(response.body).toHaveProperty('ticket');
    expect(typeof response.body.ticket).toBe('string');
    expect(mockWriteOAuthTicketCache.writeTicket).toHaveBeenCalledTimes(1);
  });

  it('should authorize OAuth ticket and redirect to provider URL', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/api/auth/authorize')
      .query({
        ticket: 'valid-ticket',
        redirect_url: 'https://frontend.example.com/after-auth',
      })
      .expect(302);

    expect(response.headers.location).toContain(
      'https://vimar.example.com/oauth/authorize',
    );
    expect(mockReadOAuthTicketCache.readValidTicket).toHaveBeenCalledWith(
      'valid-ticket',
    );
    expect(mockDeleteOAuthTicketCache.deleteTicket).toHaveBeenCalledWith(
      'valid-ticket',
    );
  });

  it('should handle callback and persist tokens', async () => {
    const state = Buffer.from(
      JSON.stringify({
        redirectUrl: 'https://frontend.example.com/done',
        userId: 1,
      }),
    ).toString('base64');

    const response = await request(app.getHttpServer() as http.Server)
      .get('/my-vimar/callback')
      .query({ code: 'oauth-code-1', state })
      .expect(302);

    expect(response.headers.location).toBe('https://frontend.example.com/done');
    expect(mockGetTokensFromApi.getTokensWithCode).toHaveBeenCalledWith(
      'oauth-code-1',
    );
    expect(mockWriteTokensCache.writeTokens).toHaveBeenCalledTimes(1);
  });

  it('should validate callback query parameters', async () => {
    await request(app.getHttpServer() as http.Server)
      .get('/my-vimar/callback')
      .query({ code: 'oauth-code-1' })
      .expect(400);
  });
});
