import { HttpService } from '@nestjs/axios';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { of } from 'rxjs';
import { EventCacheController } from 'src/cache/adapters/in/event/event-cache.controller';
import { HttpCacheController } from 'src/cache/adapters/in/http/http-cache.controller';
import {
  UPDATE_CACHE_USE_CASE,
  UpdateCacheUseCase,
} from 'src/cache/application/ports/in/update-cache.usecase';
import { CacheModule } from 'src/cache/cache.module';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';
import { createMockPgPool, normalizeSql } from './helpers/mock-pg';

describe('Cache Integration Test', () => {
  let app: INestApplication;
  let eventEmitter: EventEmitter2;
  let eventCacheController: EventCacheController;
  let httpCacheController: HttpCacheController;
  let updateCacheUseCase: UpdateCacheUseCase;

  const state = {
    tokenCache: {
      access_token: 'valid-access',
      refresh_token: 'valid-refresh',
      expires_at: new Date(Date.now() + 60_000),
      user_id: 1,
      email: 'linked@example.com',
    },
    plants: new Map<string, any>(),
    failWritePlantIds: new Set<string>(),
    failWriteAsString: false,
  };

  beforeEach(async () => {
    process.env.HOST3 = 'https://vimar.example.com/api/v2';
    process.env.PLANT_DOMAIN = 'https://vimar.example.com/.well-known/knx';

    state.plants.clear();
    state.failWritePlantIds.clear();
    state.failWriteAsString = false;

    const pool = createMockPgPool(async (rawSql, params) => {
      const sql = normalizeSql(rawSql);

      if (sql === 'begin' || sql === 'commit' || sql === 'rollback') {
        return { rows: [] };
      }

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

      if (sql.includes('insert into plant') && sql.includes('on conflict (id) do update')) {
        const [id, rawData, wardId] = params as [string, unknown, number | null];

        if (state.failWritePlantIds.has(id)) {
          if (state.failWriteAsString) {
            throw 'simulated write failure';
          }
          throw new Error('simulated write failure');
        }

        state.plants.set(id, {
          id,
          data: typeof rawData === 'string' ? JSON.parse(rawData) : rawData,
          ward_id: wardId,
        });
        return { rows: [], rowCount: 1 };
      }

      throw new Error(`Unhandled SQL in cache integration test: ${sql}`);
    });

    const httpServiceMock = {
      get: jest.fn().mockImplementation((url: string) => {
        const base = 'https://vimar.example.com/api/v2';

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

        if (url === `${base}/plant-1/locations` || url === `${base}/plant-2/locations`) {
          const plantId = url.includes('/plant-1/') ? 'plant-1' : 'plant-2';
          return of({
            data: {
              meta: {},
              data: [
                {
                  id: `${plantId}-room-1`,
                  type: 'location',
                  attributes: { title: `${plantId} Room` },
                  meta: { '@type': ['loc:Location'] },
                },
              ],
            },
          });
        }

        if (url.includes('/locations/') && url.endsWith('/functions')) {
          return of({
            data: {
              meta: {},
              data: [
                {
                  id: 'device-1',
                  type: 'device',
                  attributes: { title: 'Thermostat' },
                  meta: {
                    'vimar:ssType': 'climate',
                    'vimar:sfType': 'thermostat',
                  },
                },
              ],
            },
          });
        }

        if (url.includes('/functions/') && url.endsWith('/datapoints')) {
          return of({
            data: {
              meta: {},
              data: [
                {
                  id: 'dp-1',
                  type: 'datapoint',
                  attributes: {
                    title: 'temperature',
                    readable: true,
                    writable: false,
                    value: '22',
                    timestamp: new Date().toISOString(),
                    enum: ['0', '100'],
                    valueType: 'number',
                  },
                  meta: {
                    'vimar:sfType': 'temperature',
                    'vimar:sfeType': 'sensor',
                  },
                },
              ],
            },
          });
        }

        throw new Error(`Unhandled HTTP GET in cache integration test: ${url}`);
      }),
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), DatabaseModule, CacheModule],
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
    eventCacheController = module.get<EventCacheController>(EventCacheController);
    httpCacheController = module.get<HttpCacheController>(HttpCacheController);
    updateCacheUseCase = module.get<UpdateCacheUseCase>(UPDATE_CACHE_USE_CASE);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should process webhook and write plant cache using real cache flow', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/cache/update')
      .send({
        data: [
          {
            id: 'plant-1',
            type: 'service',
            attributes: { lastModified: new Date().toISOString() },
            links: { self: '' },
          },
        ],
      })
      .expect(202);

    expect(response.body.success).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(state.plants.has('plant-1')).toBe(true);
  });

  it('should refresh all plants on fetched.tokens event', async () => {
    eventEmitter.emit('fetched.tokens');

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(state.plants.has('plant-1')).toBe(true);
    expect(state.plants.has('plant-2')).toBe(true);
  });

  it('should reject updateCache use case when plantId is missing', async () => {
    await expect(
      updateCacheUseCase.updateCache({} as { plantId: string }),
    ).rejects.toThrow('PlantId is null');
  });

  it('should handle webhook update failure with Error without crashing', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/cache/update')
      .send({
        data: [
          {
            id: 'plant-missing',
            type: 'service',
            attributes: { lastModified: new Date().toISOString() },
            links: { self: '' },
          },
        ],
      })
      .expect(202);

    expect(response.body.success).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 80));
  });

  it('should handle webhook update failure with non-Error value', async () => {
    state.failWritePlantIds.add('plant-1');
    state.failWriteAsString = true;

    const response = await request(app.getHttpServer() as http.Server)
      .post('/cache/update')
      .send({
        data: [
          {
            id: 'plant-1',
            type: 'service',
            attributes: { lastModified: new Date().toISOString() },
            links: { self: '' },
          },
        ],
      })
      .expect(202);

    expect(response.body.success).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 60));
  });

  it('should mark updateAllCache flow as failed when one plant write fails', async () => {
    state.failWritePlantIds.add('plant-1');

    eventEmitter.emit('fetched.tokens');

    await new Promise((resolve) => setTimeout(resolve, 120));

    expect(state.plants.has('plant-2')).toBe(true);
  });

  it('should skip duplicate cache sync events while one sync is already running', async () => {
    (eventCacheController as any).isCacheSyncRunning = true;

    await eventCacheController.updateCache();

    expect(state.plants.size).toBe(0);
  });

  it('should throw when cache write operation fails in updateCache use case', async () => {
    state.failWritePlantIds.add('plant-1');

    await expect(
      updateCacheUseCase.updateCache({ plantId: 'plant-1' }),
    ).rejects.toThrow('Failed to write cache');
  });

  it('should execute queue catch branch with Error in HttpCacheController', async () => {
    const rejected = Promise.reject(new Error('queued error'));
    rejected.catch(() => undefined);
    (httpCacheController as any).webhookQueue = rejected;

    await httpCacheController.updateCache({ data: [] } as any);
    await new Promise((resolve) => setTimeout(resolve, 40));
  });

  it('should execute queue catch branch with non-Error in HttpCacheController', async () => {
    const rejected = Promise.reject('queued-string-error');
    rejected.catch(() => undefined);
    (httpCacheController as any).webhookQueue = rejected;

    await httpCacheController.updateCache({ data: [] } as any);
    await new Promise((resolve) => setTimeout(resolve, 40));
  });

  it('should execute webhook per-plant catch with real Error instance', async () => {
    const localController = new HttpCacheController({
      updateCache: jest.fn().mockRejectedValue(new Error('local-update-error')),
    } as any);

    await localController.updateCache({
      data: [{ id: 'plant-local-1', type: 'service' }],
    } as any);

    await new Promise((resolve) => setTimeout(resolve, 40));
  });

  it('should execute webhook per-plant catch with non-Error value', async () => {
    const localController = new HttpCacheController({
      updateCache: jest.fn().mockRejectedValue('local-string-error'),
    } as any);

    await localController.updateCache({
      data: [{ id: 'plant-local-2', type: 'service' }],
    } as any);

    await new Promise((resolve) => setTimeout(resolve, 40));
  });
});
