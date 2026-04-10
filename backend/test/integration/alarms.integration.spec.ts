import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { AlarmsModule } from 'src/alarms/alarms.module';
import { AlarmPriority } from 'src/alarms/domain/models/alarm-priority.enum';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';
import { createMockPgPool, normalizeSql } from './helpers/mock-pg';

describe('Alarms Integration Test', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const ACCESS_SECRET = 'integration-access-secret';

  const state = {
    rules: [
      {
        id: 'rule-1',
        datapoint_name: 'temperature',
        plant_name: 'Plant A',
        room_name: 'Room 1',
        device_name: 'Thermostat',
        name: 'High Temperature',
        threshold_operator: '>',
        threshold_value: '30',
        priority: AlarmPriority.RED,
        arming_time: new Date('2026-04-10T08:00:00.000Z'),
        dearming_time: new Date('2026-04-10T20:00:00.000Z'),
        is_armed: true,
        device_id: 'device-1',
        plant_id: 'plant-1',
        datapoint_id: 'dp-1',
      },
    ],
    events: [
      {
        id: 'event-1',
        plant_name: 'Plant A',
        room_name: 'Room 1',
        device_name: 'Thermostat',
        device_id: 'device-1',
        alarm_rule_id: 'rule-1',
        alarm_name: 'High Temperature',
        priority: AlarmPriority.RED,
        activation_time: new Date('2026-04-10T10:00:00.000Z'),
        resolution_time: new Date('2026-04-10T10:30:00.000Z'),
        user_id: 1,
        user_username: 'admin.user',
        ward_id: 10,
      },
      {
        id: 'event-2',
        plant_name: 'Plant A',
        room_name: 'Room 1',
        device_name: 'Thermostat',
        device_id: 'device-1',
        alarm_rule_id: 'rule-1',
        alarm_name: 'High Temperature',
        priority: AlarmPriority.RED,
        activation_time: new Date('2026-04-10T11:00:00.000Z'),
        resolution_time: null as Date | null,
        user_id: null as number | null,
        user_username: null as string | null,
        ward_id: 10,
      },
    ],
  };

  beforeEach(async () => {
    process.env.ACCESS_SECRET = ACCESS_SECRET;

    const pool = createMockPgPool(async (rawSql, params) => {
      const sql = normalizeSql(rawSql);

      if (sql === 'begin' || sql === 'commit' || sql === 'rollback') {
        return { rows: [] };
      }

      if (sql.includes('with inserted as ( insert into alarm_rule')) {
        const [
          id,
          name,
          thresholdOperator,
          thresholdValue,
          priority,
          armingTime,
          dearmingTime,
          isArmed,
          deviceId,
          plantId,
          datapointId,
        ] = params as [
          string,
          string,
          string,
          string,
          AlarmPriority,
          string,
          string,
          boolean,
          string,
          string,
          string,
        ];

        const created = {
          id,
          datapoint_name: 'temperature',
          plant_name: 'Plant A',
          room_name: 'Room 1',
          device_name: 'Thermostat',
          name,
          threshold_operator: thresholdOperator,
          threshold_value: thresholdValue,
          priority,
          arming_time: new Date(`2026-04-10T${armingTime}:00.000Z`),
          dearming_time: new Date(`2026-04-10T${dearmingTime}:00.000Z`),
          is_armed: isArmed,
          device_id: deviceId,
          plant_id: plantId,
          datapoint_id: datapointId,
        };

        state.rules.push(created);
        return { rows: [created], rowCount: 1 };
      }

      if (
        sql.includes('from alarm_rule ar') &&
        sql.includes('where d.datapoint is not null') &&
        sql.includes('and ar.is_changed_when_used = false') &&
        !sql.includes('and ar.id = $1')
      ) {
        return { rows: [...state.rules] };
      }

      if (sql.includes('from alarm_rule ar') && sql.includes('and ar.id = $1')) {
        const [id] = params as [string];
        const found = state.rules.find((r) => r.id === id);
        return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
      }

      if (sql.includes('from alarm_event ae') && sql.includes('and ae.resolution_time is not null')) {
        const managed = state.events.filter((e) => e.resolution_time !== null);
        return { rows: managed };
      }

      if (sql.includes('from alarm_event ae') && sql.includes('and ae.resolution_time is null')) {
        const unmanaged = state.events.filter((e) => e.resolution_time === null);
        return { rows: unmanaged };
      }

      if (sql.includes('from alarm_event ae') && sql.includes('where device->>\'id\' = ar.device_id') && sql.includes('limit $1 offset $2')) {
        return { rows: [...state.events] };
      }

      if (sql.includes('update alarm_event set resolution_time = now(), user_id = $2 where id = $1')) {
        const [alarmId, userId] = params as [string, number];
        const event = state.events.find((e) => e.id === alarmId);
        if (event) {
          event.resolution_time = new Date();
          event.user_id = userId;
          event.user_username = 'resolver.user';
        }
        return { rows: [], rowCount: event ? 1 : 0 };
      }

      if (sql.includes('select p.ward_id from alarm_event ae') && sql.includes('where ae.id = $1')) {
        const [alarmId] = params as [string];
        const event = state.events.find((e) => e.id === alarmId);
        return {
          rows: [{ ward_id: event?.ward_id ?? null }],
          rowCount: event ? 1 : 0,
        };
      }

      if (sql.includes('insert into alarm_event (id, alarm_rule_id, activation_time)')) {
        const [id, alarmRuleId, activationTime] = params as [string, string, Date];
        state.events.push({
          id,
          plant_name: 'Plant A',
          room_name: 'Room 1',
          device_name: 'Thermostat',
          device_id: 'device-1',
          alarm_rule_id: alarmRuleId,
          alarm_name: 'High Temperature',
          priority: AlarmPriority.RED,
          activation_time: activationTime,
          resolution_time: null,
          user_id: null,
          user_username: null,
          ward_id: 10,
        });
        return { rows: [{ id }], rowCount: 1 };
      }

      throw new Error(`Unhandled SQL in alarms integration test: ${sql}`);
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), DatabaseModule, AlarmsModule],
    })
      .overrideProvider(PG_POOL)
      .useValue(pool)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: false,
        forbidNonWhitelisted: false,
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

  const userToken = () =>
    jwtService.sign({ id: 2, username: 'operator.user', role: 'OPERATORE_SANITARIO' });

  it('should create alarm rule through real controller/service/repository', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/alarm-rules')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({
        name: 'Too Hot',
        datapointId: 'dp-1',
        deviceId: 'device-1',
        plantId: 'plant-1',
        priority: AlarmPriority.RED,
        thresholdOperator: '>',
        thresholdValue: '29',
        armingTime: '08:00',
        dearmingTime: '20:00',
      })
      .expect(201);

    expect(response.body).toHaveProperty('name', 'Too Hot');
    expect(state.rules.length).toBe(2);
  });

  it('should list alarm rules', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/alarm-rules')
      .set('Authorization', `Bearer ${userToken()}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
  });

  it('should resolve alarm event and emit resolution flow', async () => {
    await request(app.getHttpServer() as http.Server)
      .patch('/alarm-events/resolve')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ alarmId: 'event-2', userId: 2 })
      .expect(200);

    const resolved = state.events.find((e) => e.id === 'event-2');
    expect(resolved?.resolution_time).not.toBeNull();
    expect(resolved?.user_id).toBe(2);
  });
});
