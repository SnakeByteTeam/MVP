import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlarmEventsService } from '../../../src/alarms/application/services/alarm-events.service';
import { AlarmPriority } from '../../../src/alarms/domain/models/alarm-priority.enum';
import {
  GET_ALL_ALARM_EVENTS_PORT,
  GetAllAlarmEventsPort,
} from '../../../src/alarms/application/ports/out/get-all-alarm-events.port';
import {
  GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
  GetAllManagedAlarmEventsByUserIdPort,
} from '../../../src/alarms/application/ports/out/get-all-managed-alarm-events-by-user-id-port.interface';
import {
  GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
  GetAllUnmanagedAlarmEventsByUserIdPort,
} from '../../../src/alarms/application/ports/out/get-all-unmanaged-alarm-events-by-user-id-port.interface';
import {
  GET_ALARM_EVENT_BY_ID_PORT,
  GetAlarmEventByIdPort,
} from '../../../src/alarms/application/ports/out/get-alarm-event-by-id-port.interface';
import {
  RESOLVE_ALARM_EVENT_PORT,
  ResolveAlarmEventPort,
} from '../../../src/alarms/application/ports/out/resolve-alarm-event-port.interface';
import {
  GET_WARD_ALARM_EVENT_PORT,
  GetWardAlarmEventPort,
} from '../../../src/alarms/application/ports/out/get-ward-alarm-event.port';
import { GetAlarmEventByIdCmd } from '../../../src/alarms/application/commands/get-alarm-event-by-id-cmd';
import { GetAllAlarmEventsCmd } from '../../../src/alarms/application/commands/get-all-alarm-events-cmd';
import { GetAllManagedAlarmEventsByUserIdCmd } from '../../../src/alarms/application/commands/get-all-managed-alarm-events-by-user-id-cmd';
import { GetAllUnmanagedAlarmEventsByUserIdCmd } from '../../../src/alarms/application/commands/get-all-unmanaged-alarm-events-by-user-id-cmd';
import { ResolveAlarmEventCmd } from '../../../src/alarms/application/commands/resolve-alarm-event-cmd';
import { AlarmEvent } from '../../../src/alarms/domain/models/alarm-event.model';

describe('AlarmEventsService', () => {
  let service: AlarmEventsService;
  let getAllAlarmEventsPort: jest.Mocked<GetAllAlarmEventsPort>;
  let getAllManagedPort: jest.Mocked<GetAllManagedAlarmEventsByUserIdPort>;
  let getAllUnmanagedPort: jest.Mocked<GetAllUnmanagedAlarmEventsByUserIdPort>;
  let getAlarmEventByIdPort: jest.Mocked<GetAlarmEventByIdPort>;
  let resolveAlarmEventPort: jest.Mocked<ResolveAlarmEventPort>;
  let getWardAlarmEventPort: jest.Mocked<GetWardAlarmEventPort>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlarmEventsService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: GET_ALL_ALARM_EVENTS_PORT,
          useValue: {
            getAllAlarmEvents: jest.fn(),
          },
        },
        {
          provide: GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
          useValue: {
            getAllManagedAlarmEventsByUserId: jest.fn(),
          },
        },
        {
          provide: GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
          useValue: {
            getAllUnmanagedAlarmEventsByUserId: jest.fn(),
          },
        },
        {
          provide: GET_ALARM_EVENT_BY_ID_PORT,
          useValue: {
            getAlarmEventById: jest.fn(),
          },
        },
        {
          provide: RESOLVE_ALARM_EVENT_PORT,
          useValue: {
            resolveAlarmEvent: jest.fn(),
          },
        },
        {
          provide: GET_WARD_ALARM_EVENT_PORT,
          useValue: {
            getWardAlarmEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AlarmEventsService>(AlarmEventsService);
    getAllAlarmEventsPort = module.get(GET_ALL_ALARM_EVENTS_PORT);
    getAllManagedPort = module.get(GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_PORT);
    getAllUnmanagedPort = module.get(GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_PORT);
    getAlarmEventByIdPort = module.get(GET_ALARM_EVENT_BY_ID_PORT);
    resolveAlarmEventPort = module.get(RESOLVE_ALARM_EVENT_PORT);
    getWardAlarmEventPort = module.get(GET_WARD_ALARM_EVENT_PORT);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('getAlarmEventById', () => {
    it('should return alarm event when found', async () => {
      const mockEvent: any = {
        id: 'event-001',
        position: 'event-position-001',
        alarmRuleId: 'rule-001',
        alarmName: 'Temperature Alert',
        priority: AlarmPriority.RED,
        activationTime: new Date('2024-01-15T10:30:00Z'),
        resolutionTime: null,
        userId: null,
        userUsername: null,
      };
      const cmd = new GetAlarmEventByIdCmd('event-001');

      getAlarmEventByIdPort.getAlarmEventById.mockResolvedValue(mockEvent);

      const result = await service.getAlarmEventById(cmd);

      expect(result).toEqual(mockEvent);
      expect(getAlarmEventByIdPort.getAlarmEventById).toHaveBeenCalledWith(cmd);
    });

    it('should return null when alarm event not found', async () => {
      const cmd = new GetAlarmEventByIdCmd('nonexistent-id');

      getAlarmEventByIdPort.getAlarmEventById.mockResolvedValue(null);

      const result = await service.getAlarmEventById(cmd);

      expect(result).toBeNull();
    });
  });

  describe('getAllAlarmEvents', () => {
    it('should return all alarm events', async () => {
      const mockEvents: any[] = [
        {
          id: 'event-001',
          position: 'event-position-001',
          alarmRuleId: 'rule-001',
          alarmName: 'Temperature Alert',
          priority: AlarmPriority.RED,
          activationTime: new Date('2024-01-15T10:30:00Z'),
          resolutionTime: null,
          userId: null,
          userUsername: null,
        },
      ];
      const cmd = new GetAllAlarmEventsCmd();

      getAllAlarmEventsPort.getAllAlarmEvents.mockResolvedValue(mockEvents);

      const result = await service.getAllAlarmEvents(cmd);

      expect(result).toEqual(mockEvents);
      expect(getAllAlarmEventsPort.getAllAlarmEvents).toHaveBeenCalledWith(cmd);
    });

    it('should return empty list when no events exist', async () => {
      const cmd = new GetAllAlarmEventsCmd();

      getAllAlarmEventsPort.getAllAlarmEvents.mockResolvedValue([]);

      const result = await service.getAllAlarmEvents(cmd);

      expect(result).toEqual([]);
    });
  });

  describe('getAllManagedAlarmEventsByUserId', () => {
    it('should return managed alarm events for user', async () => {
      const mockEvents: any[] = [
        {
          id: 'event-001',
          position: 'event-position-001',
          alarmRuleId: 'rule-001',
          alarmName: 'Temperature Alert',
          priority: AlarmPriority.RED,
          activationTime: new Date('2024-01-15T10:30:00Z'),
          resolutionTime: new Date('2024-01-15T10:35:00Z'),
          userId: 1,
          userUsername: 'admin',
        },
      ];
      const cmd = new GetAllManagedAlarmEventsByUserIdCmd(1);

      getAllManagedPort.getAllManagedAlarmEventsByUserId.mockResolvedValue(mockEvents);

      const result = await service.getAllManagedAlarmEventsByUserId(cmd);

      expect(result).toEqual(mockEvents);
      expect(getAllManagedPort.getAllManagedAlarmEventsByUserId).toHaveBeenCalledWith(cmd);
    });

    it('should return empty list when user has no managed events', async () => {
      const cmd = new GetAllManagedAlarmEventsByUserIdCmd(999);

      getAllManagedPort.getAllManagedAlarmEventsByUserId.mockResolvedValue([]);

      const result = await service.getAllManagedAlarmEventsByUserId(cmd);

      expect(result).toEqual([]);
    });
  });

  describe('getAllUnmanagedAlarmEventsByUserId', () => {
    it('should return unmanaged alarm events for user', async () => {
      const mockEvents: any[] = [
        {
          id: 'event-002',
          position: 'event-position-002',
          alarmRuleId: 'rule-002',
          alarmName: 'Humidity Alert',
          priority: AlarmPriority.GREEN,
          activationTime: new Date('2024-01-15T11:00:00Z'),
          resolutionTime: null,
          userId: null,
          userUsername: null,
        },
      ];
      const cmd = new GetAllUnmanagedAlarmEventsByUserIdCmd(1);

      getAllUnmanagedPort.getAllUnmanagedAlarmEventsByUserId.mockResolvedValue(mockEvents);

      const result = await service.getAllUnmanagedAlarmEventsByUserId(cmd);

      expect(result).toEqual(mockEvents);
      expect(getAllUnmanagedPort.getAllUnmanagedAlarmEventsByUserId).toHaveBeenCalledWith(cmd);
    });

    it('should return empty list when user has no unmanaged events', async () => {
      const cmd = new GetAllUnmanagedAlarmEventsByUserIdCmd(1);

      getAllUnmanagedPort.getAllUnmanagedAlarmEventsByUserId.mockResolvedValue([]);

      const result = await service.getAllUnmanagedAlarmEventsByUserId(cmd);

      expect(result).toEqual([]);
    });
  });

  describe('resolveAlarmEvent', () => {
    it('should resolve alarm event and emit alarm.resolved event', async () => {
      const cmd = new ResolveAlarmEventCmd('event-001', 1);

      resolveAlarmEventPort.resolveAlarmEvent.mockResolvedValue(undefined);
      getWardAlarmEventPort.getWardAlarmEvent.mockResolvedValue(123);

      await service.resolveAlarmEvent(cmd);

      expect(resolveAlarmEventPort.resolveAlarmEvent).toHaveBeenCalledWith(cmd);
      expect(getWardAlarmEventPort.getWardAlarmEvent).toHaveBeenCalledWith({ alarmId: cmd.alarmId });
      expect(eventEmitter.emit).toHaveBeenCalledWith('alarm.resolved', {
        alarmEventId: 'event-001',
        wardId: 123,
      });
    });

    it('should handle resolving multiple alarm events', async () => {
      const cmd1 = new ResolveAlarmEventCmd('event-001', 1);
      const cmd2 = new ResolveAlarmEventCmd('event-002', 2);

      resolveAlarmEventPort.resolveAlarmEvent.mockResolvedValue(undefined);
      getWardAlarmEventPort.getWardAlarmEvent
        .mockResolvedValueOnce(123)
        .mockResolvedValueOnce(456);

      await service.resolveAlarmEvent(cmd1);
      await service.resolveAlarmEvent(cmd2);

      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(1, 'alarm.resolved', {
        alarmEventId: 'event-001',
        wardId: 123,
      });
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(2, 'alarm.resolved', {
        alarmEventId: 'event-002',
        wardId: 456,
      });
    });
  });
});
