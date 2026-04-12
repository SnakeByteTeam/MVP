import { Test, TestingModule } from '@nestjs/testing';
import { AlarmEventsService } from 'src/alarms/application/services/alarm-events.service';
import { GetAllManagedAlarmEventsByUserIdPort } from 'src/alarms/application/ports/out/get-all-managed-alarm-events-by-user-id-port.interface';
import { GetAllUnmanagedAlarmEventsByUserIdPort } from 'src/alarms/application/ports/out/get-all-unmanaged-alarm-events-by-user-id-port.interface';
import { GetAlarmEventByIdPort } from 'src/alarms/application/ports/out/get-alarm-event-by-id-port.interface';
import { GetAllAlarmEventsPort } from 'src/alarms/application/ports/out/get-all-alarm-events.port';
import { ResolveAlarmEventPort } from 'src/alarms/application/ports/out/resolve-alarm-event-port.interface';
import {
  GET_WARD_ALARM_EVENT_PORT,
  GetWardAlarmEventPort,
} from 'src/alarms/application/ports/out/get-ward-alarm-event.port';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlarmEvent } from 'src/alarms/domain/models/alarm-event.model';
import { AlarmPriority } from 'src/alarms/domain/models/alarm-priority.enum';
import { GetAlarmEventByIdCmd } from 'src/alarms/application/commands/get-alarm-event-by-id-cmd';
import { GetAllAlarmEventsCmd } from 'src/alarms/application/commands/get-all-alarm-events-cmd';
import { GetAllManagedAlarmEventsByUserIdCmd } from 'src/alarms/application/commands/get-all-managed-alarm-events-by-user-id-cmd';
import { GetAllUnmanagedAlarmEventsByUserIdCmd } from 'src/alarms/application/commands/get-all-unmanaged-alarm-events-by-user-id-cmd';
import { ResolveAlarmEventCmd } from 'src/alarms/application/commands/resolve-alarm-event-cmd';
import {
  GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
} from 'src/alarms/application/ports/out/get-all-managed-alarm-events-by-user-id-port.interface';
import {
  GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
} from 'src/alarms/application/ports/out/get-all-unmanaged-alarm-events-by-user-id-port.interface';
import {
  GET_ALARM_EVENT_BY_ID_PORT,
} from 'src/alarms/application/ports/out/get-alarm-event-by-id-port.interface';
import {
  GET_ALL_ALARM_EVENTS_PORT,
} from 'src/alarms/application/ports/out/get-all-alarm-events.port';
import {
  RESOLVE_ALARM_EVENT_PORT,
} from 'src/alarms/application/ports/out/resolve-alarm-event-port.interface';

describe('AlarmEventsService', () => {
  let service: AlarmEventsService;
  let mockGetAllManagedAlarmEventsByUserIdPort: jest.Mocked<
    GetAllManagedAlarmEventsByUserIdPort
  >;
  let mockGetAllUnmanagedAlarmEventsByUserIdPort: jest.Mocked<
    GetAllUnmanagedAlarmEventsByUserIdPort
  >;
  let mockGetAlarmEventByIdPort: jest.Mocked<GetAlarmEventByIdPort>;
  let mockGetAllAlarmEventsPort: jest.Mocked<GetAllAlarmEventsPort>;
  let mockResolveAlarmEventPort: jest.Mocked<ResolveAlarmEventPort>;
  let mockGetWardAlarmEventPort: jest.Mocked<GetWardAlarmEventPort>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    mockGetAllManagedAlarmEventsByUserIdPort = {
      getAllManagedAlarmEventsByUserId: jest.fn(),
    };

    mockGetAllUnmanagedAlarmEventsByUserIdPort = {
      getAllUnmanagedAlarmEventsByUserId: jest.fn(),
    };

    mockGetAlarmEventByIdPort = {
      getAlarmEventById: jest.fn(),
    };

    mockGetAllAlarmEventsPort = {
      getAllAlarmEvents: jest.fn(),
    };

    mockResolveAlarmEventPort = {
      resolveAlarmEvent: jest.fn(),
    };

    mockGetWardAlarmEventPort = {
      getWardAlarmEvent: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlarmEventsService,
        {
          provide: GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
          useValue: mockGetAllManagedAlarmEventsByUserIdPort,
        },
        {
          provide: GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
          useValue: mockGetAllUnmanagedAlarmEventsByUserIdPort,
        },
        {
          provide: GET_ALARM_EVENT_BY_ID_PORT,
          useValue: mockGetAlarmEventByIdPort,
        },
        {
          provide: GET_ALL_ALARM_EVENTS_PORT,
          useValue: mockGetAllAlarmEventsPort,
        },
        {
          provide: RESOLVE_ALARM_EVENT_PORT,
          useValue: mockResolveAlarmEventPort,
        },
        {
          provide: GET_WARD_ALARM_EVENT_PORT,
          useValue: mockGetWardAlarmEventPort,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<AlarmEventsService>(AlarmEventsService);
  });

  describe('getAlarmEventById', () => {
    it('should return alarm event by id', async () => {
      const mockEvent = new AlarmEvent(
        'event-1',
        'Ward A - Room 101',
        'rule-1',
        'High Temperature',
        AlarmPriority.WHITE,
        new Date('2026-04-12T10:00:00Z'),
        new Date('2026-04-12T11:00:00Z'),
        5,
        'nurse_john',
      );
      const cmd = new GetAlarmEventByIdCmd('event-1');

      mockGetAlarmEventByIdPort.getAlarmEventById.mockResolvedValue(mockEvent);

      const result = await service.getAlarmEventById(cmd);

      expect(result).toEqual(mockEvent);
      expect(mockGetAlarmEventByIdPort.getAlarmEventById).toHaveBeenCalledWith(
        cmd,
      );
    });

    it('should return null when event not found', async () => {
      const cmd = new GetAlarmEventByIdCmd('non-existent');

      mockGetAlarmEventByIdPort.getAlarmEventById.mockResolvedValue(null);

      const result = await service.getAlarmEventById(cmd);

      expect(result).toBeNull();
    });

    it('should propagate port errors', async () => {
      const cmd = new GetAlarmEventByIdCmd('event-1');
      const error = new Error('Database error');

      mockGetAlarmEventByIdPort.getAlarmEventById.mockRejectedValue(error);

      await expect(service.getAlarmEventById(cmd)).rejects.toThrow(error);
    });
  });

  describe('getAllAlarmEvents', () => {
    it('should return all alarm events', async () => {
      const mockEvents = [
        new AlarmEvent(
          'event-1',
          'Ward A',
          'rule-1',
          'High Temperature',
          AlarmPriority.WHITE,
          new Date('2026-04-12T10:00:00Z'),
          new Date('2026-04-12T11:00:00Z'),
          5,
          'nurse_john',
        ),
        new AlarmEvent(
          'event-2',
          'Ward B',
          'rule-2',
          'Low O2',
          AlarmPriority.WHITE,
          new Date('2026-04-12T09:00:00Z'),
          null,
          null,
          null,
        ),
      ];
      const cmd = new GetAllAlarmEventsCmd(10, 0);

      mockGetAllAlarmEventsPort.getAllAlarmEvents.mockResolvedValue(
        mockEvents,
      );

      const result = await service.getAllAlarmEvents(cmd);

      expect(result).toEqual(mockEvents);
      expect(mockGetAllAlarmEventsPort.getAllAlarmEvents).toHaveBeenCalledWith(
        cmd,
      );
    });

    it('should return empty array when no events exist', async () => {
      const cmd = new GetAllAlarmEventsCmd(10, 0);

      mockGetAllAlarmEventsPort.getAllAlarmEvents.mockResolvedValue([]);

      const result = await service.getAllAlarmEvents(cmd);

      expect(result).toEqual([]);
    });

    it('should propagate port errors', async () => {
      const cmd = new GetAllAlarmEventsCmd(10, 0);
      const error = new Error('Database error');

      mockGetAllAlarmEventsPort.getAllAlarmEvents.mockRejectedValue(error);

      await expect(service.getAllAlarmEvents(cmd)).rejects.toThrow(error);
    });
  });

  describe('getAllManagedAlarmEventsByUserId', () => {
    it('should return managed alarm events by user id', async () => {
      const mockEvents = [
        new AlarmEvent(
          'event-1',
          'Ward A',
          'rule-1',
          'High Temperature',
          AlarmPriority.WHITE,
          new Date('2026-04-12T10:00:00Z'),
          new Date('2026-04-12T11:00:00Z'),
          5,
          'nurse_john',
        ),
      ];
      const cmd = new GetAllManagedAlarmEventsByUserIdCmd(5, 10, 0);

      mockGetAllManagedAlarmEventsByUserIdPort.getAllManagedAlarmEventsByUserId.mockResolvedValue(
        mockEvents,
      );

      const result = await service.getAllManagedAlarmEventsByUserId(cmd);

      expect(result).toEqual(mockEvents);
      expect(
        mockGetAllManagedAlarmEventsByUserIdPort.getAllManagedAlarmEventsByUserId,
      ).toHaveBeenCalledWith(cmd);
    });

    it('should return empty array when user has no managed events', async () => {
      const cmd = new GetAllManagedAlarmEventsByUserIdCmd(999, 10, 0);

      mockGetAllManagedAlarmEventsByUserIdPort.getAllManagedAlarmEventsByUserId.mockResolvedValue(
        [],
      );

      const result = await service.getAllManagedAlarmEventsByUserId(cmd);

      expect(result).toEqual([]);
    });

    it('should propagate port errors', async () => {
      const cmd = new GetAllManagedAlarmEventsByUserIdCmd(5, 10, 0);
      const error = new Error('Database error');

      mockGetAllManagedAlarmEventsByUserIdPort.getAllManagedAlarmEventsByUserId.mockRejectedValue(
        error,
      );

      await expect(
        service.getAllManagedAlarmEventsByUserId(cmd),
      ).rejects.toThrow(error);
    });
  });

  describe('getAllUnmanagedAlarmEventsByUserId', () => {
    it('should return unmanaged alarm events by user id', async () => {
      const mockEvents = [
        new AlarmEvent(
          'event-2',
          'Ward B',
          'rule-2',
          'Low O2',
          AlarmPriority.WHITE,
          new Date('2026-04-12T09:00:00Z'),
          null,
          null,
          null,
        ),
      ];
      const cmd = new GetAllUnmanagedAlarmEventsByUserIdCmd(5, 10, 0);

      mockGetAllUnmanagedAlarmEventsByUserIdPort.getAllUnmanagedAlarmEventsByUserId.mockResolvedValue(
        mockEvents,
      );

      const result = await service.getAllUnmanagedAlarmEventsByUserId(cmd);

      expect(result).toEqual(mockEvents);
      expect(
        mockGetAllUnmanagedAlarmEventsByUserIdPort.getAllUnmanagedAlarmEventsByUserId,
      ).toHaveBeenCalledWith(cmd);
    });

    it('should return empty array when user has no unmanaged events', async () => {
      const cmd = new GetAllUnmanagedAlarmEventsByUserIdCmd(999, 10, 0);

      mockGetAllUnmanagedAlarmEventsByUserIdPort.getAllUnmanagedAlarmEventsByUserId.mockResolvedValue(
        [],
      );

      const result = await service.getAllUnmanagedAlarmEventsByUserId(cmd);

      expect(result).toEqual([]);
    });

    it('should propagate port errors', async () => {
      const cmd = new GetAllUnmanagedAlarmEventsByUserIdCmd(5, 10, 0);
      const error = new Error('Database error');

      mockGetAllUnmanagedAlarmEventsByUserIdPort.getAllUnmanagedAlarmEventsByUserId.mockRejectedValue(
        error,
      );

      await expect(
        service.getAllUnmanagedAlarmEventsByUserId(cmd),
      ).rejects.toThrow(error);
    });
  });

  describe('resolveAlarmEvent', () => {
    it('should resolve alarm event and emit event', async () => {
      const cmd = new ResolveAlarmEventCmd('event-1', 5);

      mockResolveAlarmEventPort.resolveAlarmEvent.mockResolvedValue(undefined);
      mockGetWardAlarmEventPort.getWardAlarmEvent.mockResolvedValue(5);

      await service.resolveAlarmEvent(cmd);

      expect(mockResolveAlarmEventPort.resolveAlarmEvent).toHaveBeenCalledWith(
        cmd,
      );
      expect(mockGetWardAlarmEventPort.getWardAlarmEvent).toHaveBeenCalledWith({
        alarmId: 'event-1',
      });
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('alarm.resolved', {
        alarmEventId: 'event-1',
        wardId: 5,
      });
    });

    it('should emit alarm.resolved event with correct ward id', async () => {
      const cmd = new ResolveAlarmEventCmd('event-2', 10);

      mockResolveAlarmEventPort.resolveAlarmEvent.mockResolvedValue(undefined);
      mockGetWardAlarmEventPort.getWardAlarmEvent.mockResolvedValue(10);

      await service.resolveAlarmEvent(cmd);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('alarm.resolved', {
        alarmEventId: 'event-2',
        wardId: 10,
      });
    });

    it('should propagate resolveAlarmEvent port errors', async () => {
      const cmd = new ResolveAlarmEventCmd('event-1', 5);
      const error = new Error('Database error');

      mockResolveAlarmEventPort.resolveAlarmEvent.mockRejectedValue(error);

      await expect(service.resolveAlarmEvent(cmd)).rejects.toThrow(error);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should propagate getWardAlarmEvent port errors', async () => {
      const cmd = new ResolveAlarmEventCmd('event-1', 5);
      const error = new Error('Database error');

      mockResolveAlarmEventPort.resolveAlarmEvent.mockResolvedValue(undefined);
      mockGetWardAlarmEventPort.getWardAlarmEvent.mockRejectedValue(error);

      await expect(service.resolveAlarmEvent(cmd)).rejects.toThrow(error);
    });

    it('should call ports in correct order', async () => {
      const cmd = new ResolveAlarmEventCmd('event-1', 5);
      const callOrder: string[] = [];

      mockResolveAlarmEventPort.resolveAlarmEvent.mockImplementation(
        async () => {
          callOrder.push('resolveAlarmEvent');
        },
      );
      mockGetWardAlarmEventPort.getWardAlarmEvent.mockImplementation(
        async () => {
          callOrder.push('getWardAlarmEvent');
          return 5;
        },
      );

      await service.resolveAlarmEvent(cmd);

      expect(callOrder).toEqual(['resolveAlarmEvent', 'getWardAlarmEvent']);
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple sequential operations', async () => {
      const event = new AlarmEvent(
        'event-1',
        'Ward A',
        'rule-1',
        'High Temperature',
        AlarmPriority.WHITE,
        new Date('2026-04-12T10:00:00Z'),
        null,
        null,
        null,
      );

      mockGetAlarmEventByIdPort.getAlarmEventById.mockResolvedValue(event);
      mockGetAllAlarmEventsPort.getAllAlarmEvents.mockResolvedValue([event]);

      const byId = await service.getAlarmEventById(
        new GetAlarmEventByIdCmd('event-1'),
      );
      const all = await service.getAllAlarmEvents(new GetAllAlarmEventsCmd(10, 0));

      expect(byId).toEqual(event);
      expect(all).toContain(event);
    });

    it('should handle unresolved and resolved events', async () => {
      const unresolvedEvent = new AlarmEvent(
        'event-1',
        'Ward A',
        'rule-1',
        'High Temperature',
        AlarmPriority.WHITE,
        new Date('2026-04-12T10:00:00Z'),
        null,
        null,
        null,
      );

      const resolvedEvent = new AlarmEvent(
        'event-2',
        'Ward B',
        'rule-2',
        'Low O2',
        AlarmPriority.WHITE,
        new Date('2026-04-12T09:00:00Z'),
        new Date('2026-04-12T12:00:00Z'),
        5,
        'nurse_john',
      );

      expect(unresolvedEvent.getResolutionTime()).toBeNull();
      expect(unresolvedEvent.getUserId()).toBeNull();
      expect(resolvedEvent.getResolutionTime()).not.toBeNull();
      expect(resolvedEvent.getUserId()).not.toBeNull();
    });
  });
});