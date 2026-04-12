import { Test, TestingModule } from '@nestjs/testing';
import { UserGuard } from 'src/guard/user/user.guard';
import { AdminGuard } from 'src/guard/admin/admin.guard';
import { JwtService } from '@nestjs/jwt';
import { GET_ALL_ALARM_EVENTS_USE_CASE } from 'src/alarms/application/ports/in/get-all-alarm-events-use-case.interface';
import { GET_ALARM_EVENT_BY_ID_USE_CASE } from 'src/alarms/application/ports/in/get-alarm-event-by-id-use-case.interface';
import { GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE } from 'src/alarms/application/ports/in/get-all-unmanaged-alarm-events-by-user-id-use-case.interface';
import { GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE } from 'src/alarms/application/ports/in/get-all-managed-alarm-events-by-user-id-use-case.interface';
import { RESOLVE_ALARM_EVENT_USE_CASE } from 'src/alarms/application/ports/in/resolve-active-alarm.use-case';
import { AlarmEventsController } from 'src/alarms/adapters/in/alarm-events.controller';

describe('AlarmEventsController', () => {
  let controller: AlarmEventsController;

  const mockGetAllAlarmEventsUseCase = {
    getAllAlarmEvents: jest.fn(),
  };

  const mockGetAlarmEventByIdUseCase = {
    getAlarmEventById: jest.fn(),
  };

  const mockGetAllManagedAlarmEventsByUserIdUseCase = {
    getAllManagedAlarmEventsByUserId: jest.fn(),
  };

  const mockGetAllUnmanagedAlarmEventsByUserIdUseCase = {
    getAllUnmanagedAlarmEventsByUserId: jest.fn(),
  };

  const mockResolveAlarmEventUseCase = {
    resolveAlarmEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlarmEventsController],
      providers: [
        {
          provide: GET_ALL_ALARM_EVENTS_USE_CASE,
          useValue: mockGetAllAlarmEventsUseCase,
        },
        {
          provide: GET_ALARM_EVENT_BY_ID_USE_CASE,
          useValue: mockGetAlarmEventByIdUseCase,
        },
        {
            provide: GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE,
            useValue: mockGetAllManagedAlarmEventsByUserIdUseCase
        },
        {
          provide: GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE,
          useValue: mockGetAllUnmanagedAlarmEventsByUserIdUseCase,
        },
        { provide: RESOLVE_ALARM_EVENT_USE_CASE, useValue: mockResolveAlarmEventUseCase },
        {
          provide: UserGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: AdminGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockReturnValue({ id: 1, role: 'AMMINISTRATORE' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AlarmEventsController>(AlarmEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getAllAlarmEventsUseCase.getAllAlarmEvents', async () => {
    await controller.getAllAlarmEvents(10,0);
    expect(mockGetAllAlarmEventsUseCase.getAllAlarmEvents).toHaveBeenCalled();
  });

  it('should call getAlarmEventByIdUseCase.getAlarmEventById', async () => {
    await controller.getAlarmEventById('id');
    expect(
      mockGetAlarmEventByIdUseCase.getAlarmEventById,
    ).toHaveBeenCalled();
  });

  it('should call getAllManagedAlarmEventsByUserIdUseCase.getAllManagedAlarmEventsByUserId', async () => {
    await controller.getAllManagedAlarmEventsByUserId(1,10,0);
    expect(mockGetAllManagedAlarmEventsByUserIdUseCase.getAllManagedAlarmEventsByUserId).toHaveBeenCalled();
  });

  it('should call getAllUnmanagedAlarmEventsByUserIdUseCase.getAllUnmanagedAlarmEventsByUserId', async () => {
    await controller.getAllUnmanagedAlarmEventsByUserId(1,10,0);
    expect(mockGetAllUnmanagedAlarmEventsByUserIdUseCase.getAllUnmanagedAlarmEventsByUserId).toHaveBeenCalled();
  });

    it('should call resolveAlarmEventUseCase.resolveAlarmEvent with correct args', async () => {
    const req = { userId: 1, alarmId: '' };

    await controller.resolveAlarmEvent(req);

    expect(mockResolveAlarmEventUseCase.resolveAlarmEvent).toHaveBeenCalledWith(
        expect.objectContaining({
        alarmId: '',
        userId: 1,
        }),
    );
    });
});