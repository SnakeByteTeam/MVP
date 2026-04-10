import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { createMockPgPool, normalizeSql } from './helpers/mock-pg';

describe('Users Integration Test', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const ACCESS_SECRET = 'integration-access-secret';

  const state = {
    roles: [
      { id: 1, name: 'Amministratore' },
      { id: 2, name: 'Operatore sanitario' },
    ],
    users: [
      {
        id: 1,
        username: 'admin.user',
        surname: 'Rossi',
        name: 'Mario',
        password: 'hashed',
        roleId: 1,
      },
      {
        id: 2,
        username: 'ward.user',
        surname: 'Verdi',
        name: 'Luca',
        password: 'hashed',
        roleId: 2,
      },
    ],
    wardUsers: [{ ward_id: 10, user_id: 2 }],
    userSeq: 3,
  };

  beforeEach(async () => {
    process.env.ACCESS_SECRET = ACCESS_SECRET;

    const pool = createMockPgPool(async (rawSql, params) => {
      const sql = normalizeSql(rawSql);

      if (sql.includes('select u.id, u.username, u.surname, u.name, r.name as role') && sql.includes('from "user" u') && !sql.includes('where u.id = $1') && !sql.includes('where u.id not in')) {
        const rows = state.users.map((u) => ({
          id: u.id,
          username: u.username,
          surname: u.surname,
          name: u.name,
          role: state.roles.find((r) => r.id === u.roleId)?.name ?? 'Unknown',
        }));
        return { rows };
      }

      if (sql.includes('where u.id = $1')) {
        const [id] = params as [number];
        const user = state.users.find((u) => u.id === id);
        if (!user) {
          return { rows: [], rowCount: 0 };
        }
        return {
          rows: [
            {
              id: user.id,
              username: user.username,
              surname: user.surname,
              name: user.name,
              role: state.roles.find((r) => r.id === user.roleId)?.name,
            },
          ],
          rowCount: 1,
        };
      }

      if (sql.includes('where u.id not in (select user_id from ward_user)')) {
        const unavailableIds = new Set(state.wardUsers.map((w) => w.user_id));
        const rows = state.users
          .filter((u) => !unavailableIds.has(u.id))
          .map((u) => ({
            id: u.id,
            username: u.username,
            surname: u.surname,
            name: u.name,
            role: state.roles.find((r) => r.id === u.roleId)?.name,
          }));
        return { rows };
      }

      if (sql.includes('select id from role where name = $1 limit 1')) {
        const [name] = params as [string];
        const role = state.roles.find((r) => r.name === name);
        return { rows: role ? [{ id: role.id }] : [] };
      }

      if (sql.includes('with created_user as ( insert into "user"')) {
        const [username, surname, name, tempPassword, roleId] = params as [
          string,
          string,
          string,
          string,
          number,
        ];

        const created = {
          id: state.userSeq++,
          username,
          surname,
          name,
          password: tempPassword,
          roleId,
        };
        state.users.push(created);

        return {
          rows: [
            {
              id: created.id,
              username: created.username,
              surname: created.surname,
              name: created.name,
              role: state.roles.find((r) => r.id === roleId)?.name,
            },
          ],
          rowCount: 1,
        };
      }

      if (sql.includes('with updated_user as ( update "user" set username = $1, surname = $2, name = $3 where id = $4 returning * )')) {
        const [username, surname, name, id] = params as [
          string,
          string,
          string,
          number,
        ];

        const user = state.users.find((u) => u.id === id);
        if (!user) {
          return { rows: [], rowCount: 0 };
        }

        user.username = username;
        user.surname = surname;
        user.name = name;

        return {
          rows: [
            {
              id: user.id,
              username: user.username,
              surname: user.surname,
              name: user.name,
              role: state.roles.find((r) => r.id === user.roleId)?.name,
            },
          ],
          rowCount: 1,
        };
      }

      if (sql.includes('delete from "user" where id = $1')) {
        const [id] = params as [number];
        const before = state.users.length;
        state.users = state.users.filter((u) => u.id !== id);
        return { rows: [], rowCount: before - state.users.length };
      }

      throw new Error(`Unhandled SQL in users integration test: ${sql}`);
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, UsersModule],
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

  it('should list users using real controller/service/adapter/repository chain', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('username', 'admin.user');
  });

  it('should create user and return generated tempPassword', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({
        username: 'new.user',
        surname: 'Neri',
        name: 'Paolo',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('username', 'new.user');
    expect(response.body).toHaveProperty('tempPassword');
  });

  it('should validate payload on create user', async () => {
    await request(app.getHttpServer() as http.Server)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ username: 'abc', surname: 'x', name: 'y' })
      .expect(400);
  });
});
