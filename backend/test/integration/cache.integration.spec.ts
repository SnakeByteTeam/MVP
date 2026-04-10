import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { GETVALIDTOKENPORT } from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import { CacheModule } from 'src/cache/cache.module';
import { CACHE_REPOSITORY_PORT } from 'src/cache/application/repository/cache.repository';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';

describe('Cache Integration Test', () => {
  let app: INestApplication;
  let eventEmitter: EventEmitter2;

  const mockPool = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: jest.fn(),
    }),
    end: jest.fn(),
    on: jest.fn(),
  };

  const mockGetValidTokenPort = {
    getValidToken: jest.fn<Promise<string | null>, []>(),
  };

  const mockCacheRepository = {
    fetch: jest.fn<Promise<any>, [string, string]>(),
    getAllPlantIds: jest.fn<Promise<string[]>, [string]>(),
    write: jest.fn<Promise<boolean>, [any]>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockGetValidTokenPort.getValidToken.mockResolvedValue('valid-token');
    mockCacheRepository.fetch.mockImplementation(async (_token, plantId) => ({
      id: plantId,
      name: `Plant ${plantId}`,
      rooms: [],
      wardId: 1,
    }));
    mockCacheRepository.getAllPlantIds.mockResolvedValue(['plant-a', 'plant-b']);
    mockCacheRepository.write.mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), DatabaseModule, CacheModule],
    })
      .overrideProvider(PG_POOL)
      .useValue(mockPool)
      .overrideProvider(GETVALIDTOKENPORT)
      .useValue(mockGetValidTokenPort)
      .overrideProvider(CACHE_REPOSITORY_PORT)
      .useValue(mockCacheRepository)
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
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should accept cache webhook and process only service items', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/cache/update')
      .send({
        data: [
          { id: 'plant-1', type: 'service', attributes: {}, links: { self: '' } },
          { id: 'room-1', type: 'room', attributes: {}, links: { self: '' } },
          { id: 'plant-2', type: 'service', attributes: {}, links: { self: '' } },
        ],
      })
      .expect(202);

    expect(response.body).toEqual({
      success: true,
      statusCode: 202,
      message: 'Webhook accepted. Processing update for 2 plant(s)',
    });

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(mockCacheRepository.fetch).toHaveBeenCalledTimes(2);
    expect(mockCacheRepository.write).toHaveBeenCalledTimes(2);
  });

  it('should update all cache entries on fetched.tokens event', async () => {
    eventEmitter.emit('fetched.tokens');

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(mockCacheRepository.getAllPlantIds).toHaveBeenCalledTimes(1);
    expect(mockCacheRepository.fetch).toHaveBeenCalledTimes(2);
    expect(mockCacheRepository.write).toHaveBeenCalledTimes(2);
  });

  it('should handle empty webhook payload', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/cache/update')
      .send({ data: [] })
      .expect(202);

    expect(response.body.message).toContain('0 plant(s)');
  });
});
