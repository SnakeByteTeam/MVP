import { HttpService } from '@nestjs/axios';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';
import { EventSubscriptionController } from 'src/subscription/adapters/in/event/event-sub.controller';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { createMockPgPool, normalizeSql } from './helpers/mock-pg';

describe('Subscription Integration Test', () => {
  let app: INestApplication;
  let eventEmitter: EventEmitter2;
  let eventController: EventSubscriptionController;

  const state = {
    tokenCache: {
      access_token: 'valid-access',
      refresh_token: 'valid-refresh',
      expires_at: new Date(Date.now() + 60_000),
      user_id: 1,
      email: 'linked@example.com',
    },
    nodeSubscriptions: [] as string[],
    datapointSubscriptions: [] as string[],
  };

  beforeEach(async () => {
    process.env.HOST3 = 'https://vimar.example.com/api/v2';
    process.env.PLANT_DOMAIN = 'https://vimar.example.com/.well-known/knx';
    process.env.SECRET_FOR_SUB = 'integration-secret';
    process.env.NODE_SUB_CALLBACK = 'https://callback.example.com/cache/update';
    process.env.DATAPOINT_SUB_CALLBACK =
      'https://callback.example.com/device/update';

    state.nodeSubscriptions = [];
    state.datapointSubscriptions = [];
    state.tokenCache = {
      access_token: 'valid-access',
      refresh_token: 'valid-refresh',
      expires_at: new Date(Date.now() + 60_000),
      user_id: 1,
      email: 'linked@example.com',
    };

    const pool = createMockPgPool(async (rawSql, params) => {
      const sql = normalizeSql(rawSql);

      if (sql === 'select * from token_cache') {
        return { rows: [state.tokenCache], rowCount: 1 };
      }

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

      throw new Error(`Unhandled SQL in subscription integration test: ${sql}`);
    });

    const httpServiceMock = {
      get: jest.fn().mockImplementation((url: string) => {
        if (url === 'https://vimar.example.com/.well-known/knx') {
          return of({
            data: {
              api: {
                templates: {
                  plantId: {
                    values: ['plant-1', 'plant-2'],
                  },
                },
              },
            },
          });
        }

        if (url.endsWith('/plant-1/locations/') || url.endsWith('/plant-2/locations/')) {
          return of({ data: { data: [{ id: 'site-1' }] } });
        }

        throw new Error(`Unhandled HTTP GET in subscription integration test: ${url}`);
      }),
      post: jest.fn().mockImplementation((url: string) => {
        if (url.endsWith('/plant-1/subscriptions')) {
          state.nodeSubscriptions.push('plant-1');
          return of({ data: { ok: true } });
        }

        if (url.endsWith('/plant-2/subscriptions')) {
          state.nodeSubscriptions.push('plant-2');
          return of({ data: { ok: true } });
        }

        throw new Error(`Unhandled HTTP POST in subscription integration test: ${url}`);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), DatabaseModule, SubscriptionModule],
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

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    eventController = module.get<EventSubscriptionController>(
      EventSubscriptionController,
    );
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should refresh subscriptions for all plants on cache.all.updated', async () => {
    eventEmitter.emit('cache.all.updated');

    await new Promise((resolve) => setTimeout(resolve, 120));

    expect(state.nodeSubscriptions).toContain('plant-1');
    expect(state.nodeSubscriptions).toContain('plant-2');
  });

  it('should refresh subscriptions for one plant on cache.updated', async () => {
    eventEmitter.emit('cache.updated', { plantId: 'plant-1' });

    await new Promise((resolve) => setTimeout(resolve, 120));

    expect(state.nodeSubscriptions.filter((p) => p === 'plant-1').length).toBeGreaterThan(0);
  });

  it('should execute node cron flow with real service', async () => {
    await eventController.refreshNodeSubscriptions();

    expect(state.nodeSubscriptions).toEqual(expect.arrayContaining(['plant-1', 'plant-2']));
  });
});
