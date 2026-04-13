import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from 'src/database/database.module';
import {
  NOTIFY_ALARM_RESOLUTION_USECASE,
  NotifyAlarmResolutionUseCase,
} from 'src/notifications/application/ports/in/notify-alarm-resolution.usecase';
import {
  NOTIFY_ALARM_WARD_USECASE,
  NotifyAlarmWardUseCase,
} from 'src/notifications/application/ports/in/notify-alarm-ward.usecase';
import { NotificationModule } from 'src/notifications/notification.module';
import { PG_POOL } from 'src/database/database.module';

describe('Notifications Integration Test', () => {
  let app: INestApplication;
  let eventEmitter: EventEmitter2;
  let notifyAlarmWardUseCase: NotifyAlarmWardUseCase;
  let notifyAlarmResolutionUseCase: NotifyAlarmResolutionUseCase;

  const mockPool = {
    query: jest.fn().mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 }),
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: jest.fn(),
    }),
    end: jest.fn(),
    on: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), DatabaseModule, NotificationModule],
    })
      .overrideProvider(PG_POOL)
      .useValue(mockPool)
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
    notifyAlarmWardUseCase = module.get<NotifyAlarmWardUseCase>(
      NOTIFY_ALARM_WARD_USECASE,
    );
    notifyAlarmResolutionUseCase = module.get<NotifyAlarmResolutionUseCase>(
      NOTIFY_ALARM_RESOLUTION_USECASE,
    );
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    jest.clearAllMocks();
  });

  it('should handle alarm.activated event and persist notification', async () => {
    eventEmitter.emit('alarm.activated', {
      alarmRuleId: 'alarm-rule-1',
      wardId: 1,
      alarmEventId: 'alarm-event-1',
    });

    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(mockPool.query).toHaveBeenCalledTimes(1);
  });

  it('should handle alarm.resolved event and persist notification', async () => {
    eventEmitter.emit('alarm.resolved', {
      alarmEventId: 'alarm-event-1',
      wardId: 1,
    });

    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(mockPool.query).toHaveBeenCalledTimes(1);
  });

  it('should ignore invalid alarm payload without throwing', async () => {
    eventEmitter.emit('alarm.activated', null);

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(mockPool.query).not.toHaveBeenCalled();
  });

  it('should reject ward notification when alarmEventId is missing', async () => {
    await expect(
      notifyAlarmWardUseCase.notifyAlarmWard({
        alarm: {
          alarmRuleId: 'rule-1',
          wardId: 1,
          alarmEventId: '',
        },
      }),
    ).rejects.toThrow("Can't write notification without alarm event id");
  });

  it('should reject resolution notification when wardId is missing', async () => {
    await expect(
      notifyAlarmResolutionUseCase.notifyAlarmResolution({
        alarmId: 'alarm-event-1',
        wardId: 0,
      }),
    ).rejects.toThrow("Can't write notification without parameters");
  });
});
