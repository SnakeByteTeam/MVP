import { HttpService } from '@nestjs/axios';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';
import { EventSubscriptionController } from 'src/subscription/adapters/in/event/event-sub.controller';
import {
  REFRESH_ALL_SUBSCRIPTION_USECASE,
  RefreshAllSubscriptionUseCase,
} from 'src/subscription/application/ports/in/refresh-all-subscription.usecase';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { createMockPgPool, normalizeSql } from './helpers/mock-pg';

describe('Subscription Integration Test', () => {
  let app: INestApplication;
  let eventEmitter: EventEmitter2;
  let eventController: EventSubscriptionController;
  let refreshAllSubscriptionUseCase: RefreshAllSubscriptionUseCase;

  const state = {
    tokenCache: {
      access_token: 'valid-access',
      refresh_token: 'valid-refresh',
      expires_at: new Date(Date.now() + 60_000),
      user_id: 1,
      email: 'linked@example.com',
    } as {
      access_token: string;
      refresh_token: string;
      expires_at: Date;
      user_id: number;
      email: string;
    } | null,
    nodeSubscriptions: [] as string[],
    datapointSubscriptions: [] as string[],
    emptyPlantIds: false,
    failNodePost: false,
    failDatapointPost: false,
    failLocationLookup: false,
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
    state.emptyPlantIds = false;
    state.failNodePost = false;
    state.failDatapointPost = false;
    state.failLocationLookup = false;

    const pool = createMockPgPool(async (rawSql, params) => {
      const sql = normalizeSql(rawSql);

      if (sql === 'select * from token_cache') {
        if (!state.tokenCache) {
          return { rows: [], rowCount: 0 };
        }
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
                    values: state.emptyPlantIds ? [] : ['plant-1', 'plant-2'],
                  },
                },
              },
            },
          });
        }

        if (url.endsWith('/plant-1/locations/') || url.endsWith('/plant-2/locations/')) {
          if (state.failLocationLookup) {
            return of({ data: { data: [{}] } });
          }
          return of({ data: { data: [{ id: 'site-1' }] } });
        }

        throw new Error(`Unhandled HTTP GET in subscription integration test: ${url}`);
      }),
      post: jest.fn().mockImplementation((url: string, body: any) => {
        const isNodeSub = !!body?.data?.relationships?.subscriptionNode;
        const isDatapointSub = !!body?.data?.relationships?.subscriptionDatapoints;

        if (state.failNodePost && isNodeSub) {
          throw new Error('Node subscription creation failed');
        }

        if (state.failDatapointPost && isDatapointSub) {
          throw new Error('Datapoint subscription creation failed');
        }

        if (url.endsWith('/plant-1/subscriptions') && isNodeSub) {
          state.nodeSubscriptions.push('plant-1');
          return of({ data: { ok: true } });
        }

        if (url.endsWith('/plant-2/subscriptions') && isNodeSub) {
          state.nodeSubscriptions.push('plant-2');
          return of({ data: { ok: true } });
        }

        if (url.endsWith('/plant-1/subscriptions') && isDatapointSub) {
          state.datapointSubscriptions.push('plant-1');
          return of({ data: { ok: true } });
        }

        if (url.endsWith('/plant-2/subscriptions') && isDatapointSub) {
          state.datapointSubscriptions.push('plant-2');
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
    refreshAllSubscriptionUseCase = module.get<RefreshAllSubscriptionUseCase>(
      REFRESH_ALL_SUBSCRIPTION_USECASE,
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

  it('should execute datapoint cron flow with real service', async () => {
    await eventController.refreshDatapointSubscriptions();

    expect(state.datapointSubscriptions).toEqual(
      expect.arrayContaining(['plant-1', 'plant-2']),
    );
  });

  it('should skip duplicate full-cache refresh event while another refresh is running', async () => {
    (eventController as any).isBulkRefreshRunning = true;

    await eventController.refreshAllSubsAfterFullCacheSync();

    expect(state.nodeSubscriptions).toHaveLength(0);
    expect(state.datapointSubscriptions).toHaveLength(0);
  });

  it('should handle full-cache refresh errors without throwing', async () => {
    state.tokenCache = null;

    await expect(
      eventController.refreshAllSubsAfterFullCacheSync(),
    ).resolves.toBeUndefined();
  });

  it('should handle invalid cache.updated payload without throwing', async () => {
    await expect(
      eventController.refreshAllSubsByPlantId({} as { plantId: string }),
    ).resolves.toBeUndefined();
  });

  it('should handle node refresh when no plant IDs are available', async () => {
    state.emptyPlantIds = true;

    await expect(eventController.refreshNodeSubscriptions()).resolves.toBeUndefined();
  });

  it('should handle node refresh when repository returns false', async () => {
    state.failNodePost = true;

    await expect(eventController.refreshNodeSubscriptions()).resolves.toBeUndefined();
  });

  it('should handle datapoint refresh when repository returns false', async () => {
    state.failDatapointPost = true;

    await expect(
      eventController.refreshDatapointSubscriptions(),
    ).resolves.toBeUndefined();
  });

  it('should handle datapoint refresh when location lookup is invalid', async () => {
    state.failLocationLookup = true;

    await expect(
      eventController.refreshDatapointSubscriptions(),
    ).resolves.toBeUndefined();
  });

  it('should throw when refreshAllSubscription is called without plantId', async () => {
    await expect(
      refreshAllSubscriptionUseCase.refreshAllSubscription(
        {} as { plantId: string },
      ),
    ).rejects.toThrow('PlantId is null');
  });

  it('should keep going when node refresh fails in refreshAllSubscription', async () => {
    state.failNodePost = true;

    const result = await refreshAllSubscriptionUseCase.refreshAllSubscription({
      plantId: 'plant-1',
    });

    expect(result).toBe(true);
  });

  it('should return false when datapoint refresh fails in refreshAllSubscription', async () => {
    state.failDatapointPost = true;

    const result = await refreshAllSubscriptionUseCase.refreshAllSubscription({
      plantId: 'plant-1',
    });

    expect(result).toBe(false);
  });

  it('should return false when adapter throws in refreshAllSubscription', async () => {
    state.tokenCache = null;

    const result = await refreshAllSubscriptionUseCase.refreshAllSubscription({
      plantId: 'plant-1',
    });

    expect(result).toBe(false);
  });
});
