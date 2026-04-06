import { Test, TestingModule } from '@nestjs/testing';
import { AlarmEventsService } from './alarm-events.service';
import { GET_ALL_ALARM_EVENTS_PORT } from '../ports/out/get-all-alarm-events.port';
import { GET_ALL_ALARM_EVENTS_BY_USER_ID_PORT } from '../ports/out/get-all-alarms-events-by-user-id-port.interface';
import { RESOLVE_ALARM_EVENT_PORT } from '../ports/out/resolve-alarm-event-port.interface';

describe('AlarmEventsService', () => {
  let service: AlarmEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlarmEventsService,
        {
          provide: GET_ALL_ALARM_EVENTS_BY_USER_ID_PORT,
          useValue: {
            getAllAlarmEventsByUserId: jest.fn(),
          },
        },
        {
          provide: GET_ALL_ALARM_EVENTS_PORT,
          useValue: {
            getAllAlarmEvents: jest.fn(),
          },
        },
        {
          provide: RESOLVE_ALARM_EVENT_PORT,
          useValue: {
            resolveAlarmEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AlarmEventsService>(AlarmEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
