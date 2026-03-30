import { Test, TestingModule } from '@nestjs/testing';
import { AlarmController } from '../src/alarms/adapters/in/alarm.controller';
import { AlarmService } from '../src/alarms/application/services/alarm.service';
import { Alarm } from '../src/alarms/domain/models/alarm.model';
import { ActiveAlarm } from '../src/alarms/domain/models/active-alarm.model';
import { AlarmPriority } from '../src/alarms/domain/models/alarm-priority.enum';
import { CreateAlarmDto } from '../src/alarms/infrastructure/dtos/create-alarm.dto';
import { UpdateAlarmDto } from '../src/alarms/infrastructure/dtos/update-alarm.dto';

// Mock del service — il controller non deve sapere nulla della logica interna
const mockAlarmService = {
  getAllAlarms: jest.fn(),
  getAlarm: jest.fn(),
  createAlarm: jest.fn(),
  updateAlarm: jest.fn(),
  deleteAlarm: jest.fn(),
  getActiveAlarms: jest.fn(),
  resolveActiveAlarm: jest.fn(),
};

const createdAt = new Date('2024-01-01');
const mockAlarm = new Alarm(
  'alarm-id-1', 'Temperatura soglia', 'plant-1', 'device-1',
  AlarmPriority.RED, 20, '08:00', '20:00', true, createdAt, createdAt,
);

const mockActiveAlarm = new ActiveAlarm(
  'active-id-1', 'alarm-id-1', 'Temperatura soglia',
  'Temperatura oltre soglia', new Date('2024-01-01'), null,
);

describe('AlarmController', () => {
  let controller: AlarmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlarmController],
      providers: [{ provide: AlarmService, useValue: mockAlarmService }],
    }).compile();

    controller = module.get<AlarmController>(AlarmController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllAlarms', () => {
    it('dovrebbe restituire la lista di AlarmDto', async () => {
      mockAlarmService.getAllAlarms.mockResolvedValue([mockAlarm]);
      const result = await controller.getAllAlarms();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('alarm-id-1');
      expect(result[0].plantId).toBe('plant-1');
    });

    it('dovrebbe restituire lista vuota se non ci sono allarmi', async () => {
      mockAlarmService.getAllAlarms.mockResolvedValue([]);
      const result = await controller.getAllAlarms();
      expect(result).toEqual([]);
    });
  });

  describe('getAlarm', () => {
    it('dovrebbe restituire un AlarmDto per id', async () => {
      mockAlarmService.getAlarm.mockResolvedValue(mockAlarm);
      const result = await controller.getAlarm('alarm-id-1');
      expect(result.id).toBe('alarm-id-1');
      expect(mockAlarmService.getAlarm).toHaveBeenCalledWith('alarm-id-1');
    });
  });

  describe('createAlarm', () => {
    it('dovrebbe creare un allarme e restituire AlarmDto', async () => {
      mockAlarmService.createAlarm.mockResolvedValue(mockAlarm);

      const dto = new CreateAlarmDto();
      dto.name = 'Temperatura soglia';
      dto.plantId = 'plant-1';
      dto.deviceId = 'device-1';
      dto.priority = AlarmPriority.RED;
      dto.threshold = 20;
      dto.activationTime = '08:00';
      dto.deactivationTime = '20:00';

      const result = await controller.createAlarm(dto);

      expect(result.id).toBe('alarm-id-1');
      // Verifica che il service sia stato chiamato con un CreateAlarmCmd
      // che ha i campi giusti tradotti dal DTO
      expect(mockAlarmService.createAlarm).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Temperatura soglia',
          plantId: 'plant-1',
          deviceId: 'device-1',
        }),
      );
    });
  });

  describe('updateAlarm', () => {
    it('dovrebbe aggiornare un allarme e restituire AlarmDto', async () => {
      mockAlarmService.updateAlarm.mockResolvedValue(mockAlarm);

      const dto = new UpdateAlarmDto();
      dto.priority = AlarmPriority.GREEN;

      const result = await controller.updateAlarm('alarm-id-1', dto);

      expect(result.id).toBe('alarm-id-1');
      expect(mockAlarmService.updateAlarm).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'alarm-id-1', priority: AlarmPriority.GREEN }),
      );
    });
  });

  describe('deleteAlarm', () => {
    it('dovrebbe chiamare il service con l\'id corretto', async () => {
      mockAlarmService.deleteAlarm.mockResolvedValue(undefined);
      await controller.deleteAlarm('alarm-id-1');
      expect(mockAlarmService.deleteAlarm).toHaveBeenCalledWith('alarm-id-1');
    });
  });

  describe('getActiveAlarms', () => {
    it('dovrebbe restituire la lista di ActiveAlarmDto', async () => {
      mockAlarmService.getActiveAlarms.mockResolvedValue([mockActiveAlarm]);
      const result = await controller.getActiveAlarms();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('active-id-1');
      expect(result[0].resolvedAt).toBeNull();
    });
  });

  describe('resolveActiveAlarm', () => {
    it('dovrebbe chiamare il service con l\'id corretto', async () => {
      mockAlarmService.resolveActiveAlarm.mockResolvedValue(undefined);
      await controller.resolveActiveAlarm('active-id-1');
      expect(mockAlarmService.resolveActiveAlarm).toHaveBeenCalledWith('active-id-1');
    });
  });
});
