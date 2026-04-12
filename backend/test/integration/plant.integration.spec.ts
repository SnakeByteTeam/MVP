import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';
import { PlantModule } from 'src/plant/plant.module';
import { createMockPgPool, normalizeSql } from './helpers/mock-pg';

describe('Plant Integration Test', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const ACCESS_SECRET = 'integration-access-secret';

  const state = {
    plants: [
      {
        id: 'plant-1',
        cached_at: new Date('2026-04-01T10:00:00.000Z'),
        data: { name: 'Main Plant', rooms: [] },
        ward_id: null as number | null,
      },
      {
        id: 'plant-2',
        cached_at: new Date('2026-04-01T10:00:00.000Z'),
        data: { name: 'Ward Plant', rooms: [] },
        ward_id: 10,
      },
    ],
  };

  beforeEach(async () => {
    process.env.ACCESS_SECRET = ACCESS_SECRET;

    const pool = createMockPgPool(async (rawSql, params) => {
      const sql = normalizeSql(rawSql);

      if (sql.includes('from plant') && sql.includes('where id = $1')) {
        const [id] = params as [string];
        const plant = state.plants.find((p) => p.id === id);
        return { rows: plant ? [plant] : [], rowCount: plant ? 1 : 0 };
      }

      if (sql.includes('from plant') && sql.includes('where ward_id is null')) {
        return { rows: state.plants.filter((p) => p.ward_id == null) };
      }

      if (sql.includes('from plant') && !sql.includes('where')) {
        return { rows: [...state.plants] };
      }

      if (sql === 'begin' || sql === 'commit' || sql === 'rollback') {
        return { rows: [] };
      }

      throw new Error(`Unhandled SQL in plant integration test: ${sql}`);
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, PlantModule],
    })
      .overrideProvider(PG_POOL)
      .useValue(pool)
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

  const userToken = () =>
    jwtService.sign({ id: 1, username: 'user', role: 'UTENTE' });

  it('should retrieve plant by id with real repository', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/plant')
      .query({ plantid: 'plant-1' })
      .set('Authorization', `Bearer ${userToken()}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', 'plant-1');
    expect(response.body).toHaveProperty('name', 'Main Plant');
  });

  it('should return only available plants', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/plant/available')
      .set('Authorization', `Bearer ${userToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('id', 'plant-1');
  });

  it('should return all plants', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/plant/all')
      .set('Authorization', `Bearer ${userToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
  });
});
