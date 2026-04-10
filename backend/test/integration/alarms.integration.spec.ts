import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { ALARM_EVENTS_REPOSITORY } from 'src/alarms/application/repository/alarm-events-repository.interface';
import { ALARM_RULES_REPOSITORY } from 'src/alarms/application/repository/alarm-rules-repository.interface';
import { AlarmsModule } from 'src/alarms/alarms.module';
import { AlarmPriority } from 'src/alarms/domain/models/alarm-priority.enum';
import { AlarmEventEntity } from 'src/alarms/infrastructure/entities/alarm-event-entity';
import { AlarmRuleEntity } from 'src/alarms/infrastructure/entities/alarm-rule-entity';
import { CheckAlarmEntity } from 'src/alarms/infrastructure/entities/check-alarm-entity';

describe('Alarms Integration Test', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const ACCESS_SECRET = 'integration-access-secret';

  const now = new Date('2026-04-10T10:00:00.000Z');

  const mockAlarmRulesRepository = {
    checkAlarmRule: jest.fn<
      Promise<CheckAlarmEntity | null>,
      [string, string, string]
    >(),
    createAlarmRule: jest.fn<
      Promise<AlarmRuleEntity>,
      [
        string,
        AlarmPriority,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
      ]
    >(),
    deleteAlarmRule: jest.fn<Promise<void>, [string]>(),
    getAlarmRuleById: jest.fn<Promise<AlarmRuleEntity | null>, [string]>(),
    getAllAlarmRules: jest.fn<Promise<AlarmRuleEntity[]>, []>(),
    updateAlarmRule: jest.fn<
      Promise<AlarmRuleEntity>,
      [string, string, AlarmPriority, string, string, string, string, boolean]
    >(),
  };

  const mockAlarmEventsRepository = {
    createAlarmEvent: jest.fn<Promise<string>, [string, Date]>(),
    getAlarmEventById: jest.fn<Promise<AlarmEventEntity | null>, [string]>(),
    getAllAlarmEvents: jest.fn<Promise<AlarmEventEntity[]>, [number, number]>(),
    getAllManagedAlarmEventsByUserId: jest.fn<
      Promise<AlarmEventEntity[]>,
      [number, number, number]
    >(),
    getAllUnmanagedAlarmEventsByUserId: jest.fn<
      Promise<AlarmEventEntity[]>,
      [number, number, number]
    >(),
    resolveAlarmEvent: jest.fn<Promise<void>, [string, number]>(),
    getWardAlarmEvent: jest.fn<Promise<number>, [string]>(),
  };

  const alarmRuleEntity = new AlarmRuleEntity(
    'rule-1',
    'temperature',
    'Plant A',
    'Room 1',
    'Thermostat',
    'High Temperature',
    '>',
    '30',
    AlarmPriority.RED,
    now,
    now,
    true,
    'device-1',
  );

  const alarmEventEntity = new AlarmEventEntity(
    'event-1',
    'Plant A',
    'Room 1',
    'Thermostat',
    'device-1',
    'rule-1',
    'High Temperature',
    AlarmPriority.RED,
    now,
    null,
    null,
    null,
  );

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.ACCESS_SECRET = ACCESS_SECRET;

    mockAlarmRulesRepository.checkAlarmRule.mockResolvedValue(
      new CheckAlarmEntity('rule-1', 1),
    );
    mockAlarmRulesRepository.createAlarmRule.mockResolvedValue(alarmRuleEntity);
    mockAlarmRulesRepository.deleteAlarmRule.mockResolvedValue();
    mockAlarmRulesRepository.getAlarmRuleById.mockResolvedValue(alarmRuleEntity);
    mockAlarmRulesRepository.getAllAlarmRules.mockResolvedValue([
      alarmRuleEntity,
    ]);
    mockAlarmRulesRepository.updateAlarmRule.mockResolvedValue(alarmRuleEntity);

    mockAlarmEventsRepository.createAlarmEvent.mockResolvedValue('event-1');
    mockAlarmEventsRepository.getAlarmEventById.mockResolvedValue(
      alarmEventEntity,
    );
    mockAlarmEventsRepository.getAllAlarmEvents.mockResolvedValue([
      alarmEventEntity,
    ]);
    mockAlarmEventsRepository.getAllManagedAlarmEventsByUserId.mockResolvedValue(
      [alarmEventEntity],
    );
    mockAlarmEventsRepository.getAllUnmanagedAlarmEventsByUserId.mockResolvedValue(
      [alarmEventEntity],
    );
    mockAlarmEventsRepository.resolveAlarmEvent.mockResolvedValue();
    mockAlarmEventsRepository.getWardAlarmEvent.mockResolvedValue(1);

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), AlarmsModule],
    })
      .overrideProvider(ALARM_RULES_REPOSITORY)
      .useValue(mockAlarmRulesRepository)
      .overrideProvider(ALARM_EVENTS_REPOSITORY)
      .useValue(mockAlarmEventsRepository)
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

  const userToken = () =>
    jwtService.sign({ id: 10, username: 'user', role: 'UTENTE' });

  const adminToken = () =>
    jwtService.sign({ id: 1, username: 'admin', role: 'AMMINISTRATORE' });

  it('should create an alarm rule', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/alarm-rules')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({
        name: 'High Temperature',
        datapointId: 'dp-1',
        deviceId: 'device-1',
        plantId: 'plant-1',
        priority: AlarmPriority.RED,
        thresholdOperator: '>',
        thresholdValue: '30',
        armingTime: '08:00',
        dearmingTime: '20:00',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id', 'rule-1');
    expect(response.body).toHaveProperty('name', 'High Temperature');
    expect(mockAlarmRulesRepository.createAlarmRule).toHaveBeenCalledTimes(1);
  });

  it('should list alarm rules', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/alarm-rules')
      .set('Authorization', `Bearer ${userToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('id', 'rule-1');
    expect(response.body[0]).toHaveProperty('priority', AlarmPriority.RED);
  });

  it('should list managed alarm events by user id', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/alarm-events/managed/10/20/0')
      .set('Authorization', `Bearer ${userToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('id', 'event-1');
    expect(
      mockAlarmEventsRepository.getAllManagedAlarmEventsByUserId,
    ).toHaveBeenCalledWith(10, 20, 0);
  });

  it('should resolve an alarm event', async () => {
    await request(app.getHttpServer() as http.Server)
      .patch('/alarm-events/resolve')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ alarmId: 'event-1', userId: 10 })
      .expect(200);

    expect(mockAlarmEventsRepository.resolveAlarmEvent).toHaveBeenCalledWith(
      'event-1',
      10,
    );
    expect(mockAlarmEventsRepository.getWardAlarmEvent).toHaveBeenCalledWith(
      'event-1',
    );
  });

  it('should validate create alarm rule payload', async () => {
    await request(app.getHttpServer() as http.Server)
      .post('/alarm-rules')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({
        name: 'Invalid Rule',
        datapointId: 'dp-1',
        deviceId: 'device-1',
        plantId: 'plant-1',
        priority: AlarmPriority.RED,
        thresholdOperator: '!=',
        thresholdValue: '30',
        armingTime: '08:00',
        dearmingTime: '20:00',
      })
      .expect(400);

    expect(mockAlarmRulesRepository.createAlarmRule).not.toHaveBeenCalled();
  });
});
