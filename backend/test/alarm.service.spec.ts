import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlarmService } from '../src/alarms/application/services/alarm.service';

import { GET_ALL_ALARMS_PORT } from '../src/alarms/application/ports/out/get-all-alarms.port';
import { GET_ALARM_BY_ID_PORT } from '../src/alarms/application/ports/out/get-alarm-by-id.port';
import { GET_ALL_ALARMS_BY_REQUEST_PORT } from '../src/alarms/application/ports/out/get-all-alarms-by-request.port';
import { CREATE_ALARM_PORT } from '../src/alarms/application/ports/out/create-alarm.port';
import { UPDATE_ALARM_PORT } from '../src/alarms/application/ports/out/update-alarm.port';
import { DELETE_ALARM_PORT } from '../src/alarms/application/ports/out/delete-alarm.port';
import {
  FIND_ALL_ACTIVE_ALARMS_PORT,
  FIND_ACTIVE_ALARM_BY_ID_PORT,
  FIND_ACTIVE_ALARM_BY_RULE_ID_PORT,
  SAVE_ACTIVE_ALARM_PORT,
  RESOLVE_ACTIVE_ALARM_PORT,
} from '../src/alarms/application/ports/out/find-active-alarms.port';

import { Alarm } from '../src/alarms/domain/models/alarm.model';
import { ActiveAlarm } from '../src/alarms/domain/models/active-alarm.model';
import { AlarmPriority } from '../src/alarms/domain/models/alarm-priority.enum';
import { CreateAlarmCmd } from '../src/alarms/application/commands/create-alarm.cmd';
import { UpdateAlarmCmd } from '../src/alarms/application/commands/update-alarm.cmd';
import { TriggerActiveAlarmCmd } from '../src/alarms/application/commands/trigger-active-alarm.cmd';

const mockGetAllAlarmsPort            = { getAllAlarms: jest.fn() };
const mockGetAlarmByIdPort            = { getAlarmById: jest.fn() };
const mockGetAllAlarmsByRequestPort   = { getAllAlarmsByRequest: jest.fn() };
const mockCreateAlarmPort             = { createAlarm: jest.fn() };
const mockUpdateAlarmPort             = { updateAlarm: jest.fn() };
const mockDeleteAlarmPort             = { deleteAlarm: jest.fn() };
const mockFindAllActiveAlarmsPort     = { findAllActive: jest.fn() };
const mockFindActiveAlarmByIdPort     = { findById: jest.fn() };
const mockFindActiveByRuleIdPort      = { findActiveByRuleId: jest.fn() };
const mockSaveActiveAlarmPort         = { save: jest.fn() };
const mockResolveActiveAlarmPort      = { resolve: jest.fn() };

const createdAt = new Date('2024-01-01');
const mockAlarm = new Alarm(
  'alarm-id-1', 'Temperatura soglia', 'plant-1', 'device-1',
  AlarmPriority.RED, 20, '08:00', '20:00', true, createdAt, createdAt,
);

const mockActiveAlarm = new ActiveAlarm(
  'active-id-1', 'alarm-id-1', 'Temperatura soglia',
  'Temperatura oltre soglia', new Date('2024-01-01'), null,
);

describe('AlarmService', () => {
  let service: AlarmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlarmService,
        { provide: GET_ALL_ALARMS_PORT,               useValue: mockGetAllAlarmsPort },
        { provide: GET_ALARM_BY_ID_PORT,              useValue: mockGetAlarmByIdPort },
        { provide: GET_ALL_ALARMS_BY_REQUEST_PORT,    useValue: mockGetAllAlarmsByRequestPort },
        { provide: CREATE_ALARM_PORT,                 useValue: mockCreateAlarmPort },
        { provide: UPDATE_ALARM_PORT,                 useValue: mockUpdateAlarmPort },
        { provide: DELETE_ALARM_PORT,                 useValue: mockDeleteAlarmPort },
        { provide: FIND_ALL_ACTIVE_ALARMS_PORT,       useValue: mockFindAllActiveAlarmsPort },
        { provide: FIND_ACTIVE_ALARM_BY_ID_PORT,      useValue: mockFindActiveAlarmByIdPort },
        { provide: FIND_ACTIVE_ALARM_BY_RULE_ID_PORT, useValue: mockFindActiveByRuleIdPort },
        { provide: SAVE_ACTIVE_ALARM_PORT,            useValue: mockSaveActiveAlarmPort },
        { provide: RESOLVE_ACTIVE_ALARM_PORT,         useValue: mockResolveActiveAlarmPort },
      ],
    }).compile();

    service = module.get<AlarmService>(AlarmService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllAlarms', () => {
    it('dovrebbe restituire la lista di tutti gli allarmi', async () => {
      mockGetAllAlarmsPort.getAllAlarms.mockResolvedValue([mockAlarm]);
      const result = await service.getAllAlarms();
      expect(result).toEqual([mockAlarm]);
      expect(mockGetAllAlarmsPort.getAllAlarms).toHaveBeenCalledTimes(1);
    });

    it('dovrebbe restituire lista vuota se non ci sono allarmi', async () => {
      mockGetAllAlarmsPort.getAllAlarms.mockResolvedValue([]);
      const result = await service.getAllAlarms();
      expect(result).toEqual([]);
    });
  });

  describe('getAlarm', () => {
    it('dovrebbe restituire un allarme se esiste', async () => {
      mockGetAlarmByIdPort.getAlarmById.mockResolvedValue(mockAlarm);
      const result = await service.getAlarm('alarm-id-1');
      expect(result).toEqual(mockAlarm);
      expect(mockGetAlarmByIdPort.getAlarmById).toHaveBeenCalledWith('alarm-id-1');
    });

    it('dovrebbe lanciare NotFoundException se l\'allarme non esiste', async () => {
      mockGetAlarmByIdPort.getAlarmById.mockResolvedValue(null);
      await expect(service.getAlarm('id-inesistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createAlarm', () => {
    it('dovrebbe creare un allarme e restituirlo', async () => {
      mockCreateAlarmPort.createAlarm.mockResolvedValue(mockAlarm);
      const cmd = new CreateAlarmCmd(
        'Temperatura soglia', 'plant-1', 'device-1',
        AlarmPriority.RED, 20, '08:00', '20:00',
      );
      const result = await service.createAlarm(cmd);
      expect(result).toEqual(mockAlarm);
      expect(mockCreateAlarmPort.createAlarm).toHaveBeenCalledWith(cmd);
    });
  });

  describe('updateAlarm', () => {
    it('dovrebbe aggiornare un allarme esistente', async () => {
      mockGetAlarmByIdPort.getAlarmById.mockResolvedValue(mockAlarm);
      mockUpdateAlarmPort.updateAlarm.mockResolvedValue(mockAlarm);
      const cmd = new UpdateAlarmCmd('alarm-id-1', AlarmPriority.GREEN, 25);
      const result = await service.updateAlarm(cmd);
      expect(result).toEqual(mockAlarm);
      expect(mockUpdateAlarmPort.updateAlarm).toHaveBeenCalledWith('alarm-id-1', cmd);
    });

    it('dovrebbe lanciare NotFoundException se l\'allarme non esiste', async () => {
      mockGetAlarmByIdPort.getAlarmById.mockResolvedValue(null);
      const cmd = new UpdateAlarmCmd('id-inesistente');
      await expect(service.updateAlarm(cmd)).rejects.toThrow(NotFoundException);
      expect(mockUpdateAlarmPort.updateAlarm).not.toHaveBeenCalled();
    });
  });

  describe('deleteAlarm', () => {
    it('dovrebbe eliminare un allarme esistente', async () => {
      mockGetAlarmByIdPort.getAlarmById.mockResolvedValue(mockAlarm);
      mockDeleteAlarmPort.deleteAlarm.mockResolvedValue(undefined);
      await service.deleteAlarm('alarm-id-1');
      expect(mockDeleteAlarmPort.deleteAlarm).toHaveBeenCalledWith('alarm-id-1');
    });

    it('dovrebbe lanciare NotFoundException se l\'allarme non esiste', async () => {
      mockGetAlarmByIdPort.getAlarmById.mockResolvedValue(null);
      await expect(service.deleteAlarm('id-inesistente')).rejects.toThrow(NotFoundException);
      expect(mockDeleteAlarmPort.deleteAlarm).not.toHaveBeenCalled();
    });
  });

  describe('getActiveAlarms', () => {
    it('dovrebbe restituire tutti gli allarmi attivi', async () => {
      mockFindAllActiveAlarmsPort.findAllActive.mockResolvedValue([mockActiveAlarm]);
      const result = await service.getActiveAlarms();
      expect(result).toEqual([mockActiveAlarm]);
    });

    it('dovrebbe restituire lista vuota se non ci sono allarmi attivi', async () => {
      mockFindAllActiveAlarmsPort.findAllActive.mockResolvedValue([]);
      const result = await service.getActiveAlarms();
      expect(result).toEqual([]);
    });
  });

  describe('resolveActiveAlarm', () => {
    it('dovrebbe risolvere un allarme attivo esistente', async () => {
      mockFindActiveAlarmByIdPort.findById.mockResolvedValue(mockActiveAlarm);
      mockResolveActiveAlarmPort.resolve.mockResolvedValue(undefined);
      await service.resolveActiveAlarm('active-id-1');
      expect(mockResolveActiveAlarmPort.resolve).toHaveBeenCalledWith(
        'active-id-1', expect.any(Date),
      );
    });

    it('dovrebbe lanciare NotFoundException se l\'allarme attivo non esiste', async () => {
      mockFindActiveAlarmByIdPort.findById.mockResolvedValue(null);
      await expect(service.resolveActiveAlarm('id-inesistente')).rejects.toThrow(NotFoundException);
      expect(mockResolveActiveAlarmPort.resolve).not.toHaveBeenCalled();
    });
  });

  describe('triggerActiveAlarm', () => {
    it('dovrebbe creare un nuovo ActiveAlarm se non ne esiste già uno attivo', async () => {
      mockFindActiveByRuleIdPort.findActiveByRuleId.mockResolvedValue(null);
      mockSaveActiveAlarmPort.save.mockResolvedValue(mockActiveAlarm);
      const cmd = new TriggerActiveAlarmCmd(
        'alarm-id-1', 'Temperatura soglia', 'Temperatura oltre soglia',
      );
      await service.triggerActiveAlarm(cmd);
      expect(mockSaveActiveAlarmPort.save).toHaveBeenCalledWith(
        expect.objectContaining({
          alarmRuleId: 'alarm-id-1',
          alarmName: 'Temperatura soglia',
          dangerSignal: 'Temperatura oltre soglia',
          resolvedAt: null,
        }),
      );
    });

    it('NON dovrebbe creare un ActiveAlarm se ne esiste già uno attivo', async () => {
      mockFindActiveByRuleIdPort.findActiveByRuleId.mockResolvedValue(mockActiveAlarm);
      const cmd = new TriggerActiveAlarmCmd('alarm-id-1', 'Test', 'Signal');
      await service.triggerActiveAlarm(cmd);
      expect(mockSaveActiveAlarmPort.save).not.toHaveBeenCalled();
    });
  });
});
