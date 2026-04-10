import { HttpService } from '@nestjs/axios';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { of } from 'rxjs';
import { ApiAuthVimarModule } from 'src/api-auth-vimar/api-auth-vimar.module';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';
import { createMockPgPool, normalizeSql } from './helpers/mock-pg';

describe('ApiAuthVimar Integration Test', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const ACCESS_SECRET = 'integration-access-secret';

  const state = {
    tokenCache: {
      access_token: 'cached-access',
      refresh_token: 'cached-refresh',
      expires_at: new Date(Date.now() + 60_000),
      user_id: 1,
      email: 'linked@example.com',
    } as
      | {
          access_token: string;
          refresh_token: string;
          expires_at: Date;
          user_id: number;
          email: string;
        }
      | null,
    oauthTickets: new Map<string, { user_id: number; expires_at: Date }>(),
  };

  const makeJwtWithEmail = (email: string): string => {
    const header = Buffer.from(
      JSON.stringify({ alg: 'none', typ: 'JWT' }),
    ).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ email })).toString('base64url');
    return `${header}.${payload}.`;
  };

  beforeEach(async () => {
    process.env.ACCESS_SECRET = ACCESS_SECRET;
    process.env.HOST1 = 'https://vimar.example.com/oauth/authorize';
    process.env.CLIENTID = 'test-client-id';
    process.env.CLIENTSECRET = 'test-client-secret';
    process.env.HOST2 = 'https://vimar.example.com/oauth/token';
    process.env.REDIRECT_URI = 'https://frontend.example.com/callback';

    state.tokenCache = {
      access_token: 'cached-access',
      refresh_token: 'cached-refresh',
      expires_at: new Date(Date.now() + 60_000),
      user_id: 1,
      email: 'linked@example.com',
    };
    state.oauthTickets.clear();

    const pool = createMockPgPool(async (rawSql, params) => {
      const sql = normalizeSql(rawSql);

      if (sql.includes('insert into token_cache')) {
        const [accessToken, refreshToken, expiresAt, userId, email] = params as [
          string,
          string,
          Date,
          number,
          string,
        ];
        state.tokenCache = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
          user_id: userId,
          email,
        };
        return { rows: [{ access_token: accessToken }], rowCount: 1 };
      }

      if (sql === 'select * from token_cache') {
        return { rows: state.tokenCache ? [state.tokenCache] : [] };
      }

      if (sql.includes('delete from token_cache')) {
        state.tokenCache = null;
        return { rows: [], rowCount: 1 };
      }

      if (sql.includes('select email from token_cache where user_id = $1')) {
        const [userId] = params as [number];
        if (state.tokenCache && state.tokenCache.user_id === Number(userId)) {
          return { rows: [{ email: state.tokenCache.email }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }

      if (sql.includes('insert into oauth_ticket_cache (ticket, user_id, expires_at)')) {
        const [ticket, userId, expiresAt] = params as [string, number, Date];
        state.oauthTickets.set(ticket, {
          user_id: Number(userId),
          expires_at: expiresAt,
        });
        return { rows: [], rowCount: 1 };
      }

      if (sql.includes('select ticket, user_id, expires_at from oauth_ticket_cache')) {
        const [ticket] = params as [string];
        const found = state.oauthTickets.get(ticket);
        if (!found || found.expires_at.getTime() <= Date.now()) {
          return { rows: [], rowCount: 0 };
        }
        return {
          rows: [
            {
              ticket,
              user_id: found.user_id,
              expires_at: found.expires_at,
            },
          ],
          rowCount: 1,
        };
      }

      if (sql.includes('delete from oauth_ticket_cache where ticket = $1')) {
        const [ticket] = params as [string];
        const deleted = state.oauthTickets.delete(ticket);
        return { rows: [], rowCount: deleted ? 1 : 0 };
      }

      throw new Error(`Unhandled SQL in api-auth-vimar integration test: ${sql}`);
    });

    const httpServiceMock = {
      post: jest.fn().mockImplementation((url: string, body: string) => {
        if (url.includes('/oauth/token') && body.includes('grant_type=authorization_code')) {
          return of({
            data: {
              access_token: makeJwtWithEmail('linked@example.com'),
              refresh_token: 'new-refresh-token',
              expires_in: 3600,
            },
          });
        }

        if (url.includes('/oauth/token') && body.includes('grant_type=refresh_token')) {
          return of({
            data: {
              access_token: makeJwtWithEmail('linked@example.com'),
              refresh_token: 'refreshed-token',
              expires_in: 3600,
            },
          });
        }

        throw new Error(`Unhandled HTTP POST in api-auth-vimar integration test: ${url}`);
      }),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), DatabaseModule, ApiAuthVimarModule],
    })
      .overrideProvider(PG_POOL)
      .useValue(pool)
      .overrideProvider(HttpService)
      .useValue(httpServiceMock)
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
    jwtService.sign({ id: 1, username: 'admin.user', role: 'AMMINISTRATORE' });

  it('should return account status from real token service and cache repository', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/my-vimar/account')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(response.body).toEqual({
      isLinked: true,
      email: 'linked@example.com',
    });
  });

  it('should prepare and authorize OAuth ticket end-to-end', async () => {
    const prepared = await request(app.getHttpServer() as http.Server)
      .post('/api/auth/prepare-oauth')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(201);

    expect(prepared.body).toHaveProperty('ticket');

    const authorized = await request(app.getHttpServer() as http.Server)
      .get('/api/auth/authorize')
      .query({
        ticket: prepared.body.ticket,
        redirect_url: 'https://frontend.example.com/after-auth',
      })
      .expect(302);

    expect(authorized.headers.location).toContain(
      'https://vimar.example.com/oauth/authorize',
    );
  });

  it('should handle callback and persist tokens with real token flow', async () => {
    const stateParam = Buffer.from(
      JSON.stringify({ redirectUrl: 'https://frontend.example.com/done', userId: 1 }),
    ).toString('base64');

    const response = await request(app.getHttpServer() as http.Server)
      .get('/my-vimar/callback')
      .query({ code: 'oauth-code-1', state: stateParam })
      .expect(302);

    expect(response.headers.location).toBe('https://frontend.example.com/done');
  });

  it('should disconnect account by clearing token cache', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .delete('/my-vimar/account')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(response.body).toEqual({ success: true });
    expect(state.tokenCache).toBeNull();
  });
});
