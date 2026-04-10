import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';
import { WardsModule } from 'src/wards/wards.module';
import { createMockPgPool, normalizeSql } from './helpers/mock-pg';

describe('Wards Integration Test', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const ACCESS_SECRET = 'integration-access-secret';

  const state = {
    wards: [{ id: 1, name: 'Cardiology' }],
    users: [
      { id: 1, username: 'admin.user' },
      { id: 2, username: 'ward.user' },
    ],
    wardUsers: [] as Array<{ ward_id: number; user_id: number }>,
    plants: [
      { id: 'plant-1', data: { name: 'Main Plant', rooms: [] }, ward_id: null as number | null },
    ],
    wardSeq: 2,
  };

  beforeEach(async () => {
    process.env.ACCESS_SECRET = ACCESS_SECRET;

    state.wards = [{ id: 1, name: 'Cardiology' }];
    state.wardUsers = [];
    state.plants = [
      { id: 'plant-1', data: { name: 'Main Plant', rooms: [] }, ward_id: null },
    ];
    state.wardSeq = 2;

    const pool = createMockPgPool(async (rawSql, params) => {
      const sql = normalizeSql(rawSql);

      if (sql === 'begin' || sql === 'commit' || sql === 'rollback') {
        return { rows: [] };
      }

      if (sql.includes('insert into ward (name) values ($1) returning *')) {
        const [name] = params as [string];
        const ward = { id: state.wardSeq++, name };
        state.wards.push(ward);
        return { rows: [ward], rowCount: 1 };
      }

      if (sql === 'select * from ward') {
        return { rows: [...state.wards] };
      }

      if (sql.includes('update ward set name = $1 where id = $2 returning *')) {
        const [name, id] = params as [string, number];
        const ward = state.wards.find((w) => w.id === Number(id));
        if (!ward) {
          return { rows: [], rowCount: 0 };
        }
        ward.name = name;
        return { rows: [ward], rowCount: 1 };
      }

      if (sql.includes('delete from ward where id = $1')) {
        const [id] = params as [number];
        state.wards = state.wards.filter((w) => w.id !== Number(id));
        return { rows: [], rowCount: 1 };
      }

      if (sql.includes('update plant set ward_id = null where ward_id = $1')) {
        const [wardId] = params as [number];
        state.plants
          .filter((p) => p.ward_id === Number(wardId))
          .forEach((p) => {
            p.ward_id = null;
          });
        return { rows: [], rowCount: 1 };
      }

      if (sql.includes('update plant p set ward_id = $1 where p.id = $2 returning *')) {
        const [wardId, plantId] = params as [number, string];
        const plant = state.plants.find((p) => p.id === plantId);
        if (!plant) {
          return { rows: [], rowCount: 0 };
        }
        plant.ward_id = Number(wardId);
        return { rows: [plant], rowCount: 1 };
      }

      if (sql.includes('update plant set ward_id = $1 where id = $2')) {
        const [wardId, plantId] = params as [number, string];
        const plant = state.plants.find((p) => p.id === plantId);
        if (plant) {
          plant.ward_id = Number(wardId);
        }
        return { rows: [], rowCount: plant ? 1 : 0 };
      }

      if (sql.includes('select p.id, p.data->>\'name\' as name from plant p where p.ward_id = $1')) {
        const [wardId] = params as [number];
        const rows = state.plants
          .filter((p) => p.ward_id === Number(wardId))
          .map((p) => ({ id: p.id, name: p.data.name }));
        return { rows };
      }

      if (sql.includes('with inserted as ( insert into ward_user (ward_id, user_id) values ($1, $2) returning user_id) select id, username from "user" where id = (select user_id from inserted)')) {
        const [wardId, userId] = params as [number, number];
        state.wardUsers.push({ ward_id: Number(wardId), user_id: Number(userId) });
        const user = state.users.find((u) => u.id === Number(userId));
        return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
      }

      if (sql.includes('select u.id, u.username from "user" u join ward_user wu on u.id = wu.user_id where wu.ward_id = $1')) {
        const [wardId] = params as [number];
        const userIds = state.wardUsers
          .filter((w) => w.ward_id === Number(wardId))
          .map((w) => w.user_id);
        const rows = state.users.filter((u) => userIds.includes(u.id));
        return { rows };
      }

      if (sql.includes('delete from ward_user where ward_id = $1 and user_id = $2')) {
        const [wardId, userId] = params as [number, number];
        state.wardUsers = state.wardUsers.filter(
          (w) => !(w.ward_id === Number(wardId) && w.user_id === Number(userId)),
        );
        return { rows: [], rowCount: 1 };
      }

      if (sql.includes('update plant p set ward_id = null where p.id = $1')) {
        const [plantId] = params as [string];
        const plant = state.plants.find((p) => p.id === plantId);
        if (plant) {
          plant.ward_id = null;
        }
        return { rows: [], rowCount: plant ? 1 : 0 };
      }

      if (sql.includes('update plant set ward_id = null where id = $1')) {
        const [plantId] = params as [string];
        const plant = state.plants.find((p) => p.id === plantId);
        if (plant) {
          plant.ward_id = null;
        }
        return { rows: [], rowCount: plant ? 1 : 0 };
      }

      throw new Error(`Unhandled SQL in wards integration test: ${sql}`);
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, WardsModule],
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

  const adminToken = () =>
    jwtService.sign({ id: 1, username: 'admin.user', role: 'AMMINISTRATORE' });

  it('should create and list wards with real service and adapters', async () => {
    await request(app.getHttpServer() as http.Server)
      .post('/wards')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ name: 'Neurology' })
      .expect(201);

    const response = await request(app.getHttpServer() as http.Server)
      .get('/wards')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
  });

  it('should add and remove user from ward', async () => {
    await request(app.getHttpServer() as http.Server)
      .post('/wards-users-relationships')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ wardId: 1, userId: 2 })
      .expect(201);

    const usersByWard = await request(app.getHttpServer() as http.Server)
      .get('/wards-users-relationships/1')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(usersByWard.body).toHaveLength(1);
    expect(usersByWard.body[0]).toHaveProperty('id', 2);

    await request(app.getHttpServer() as http.Server)
      .delete('/wards-users-relationships/1/2')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);
  });

  it('should add and list plants for a ward', async () => {
    await request(app.getHttpServer() as http.Server)
      .post('/wards-plants-relationships')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ wardId: 1, plantId: 'plant-1' })
      .expect(201);

    const response = await request(app.getHttpServer() as http.Server)
      .get('/wards-plants-relationships/1')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('id', 'plant-1');
  });
});
