import { Test, TestingModule } from '@nestjs/testing';
import { ActiveAlarmController } from '../src/alarms/adapters/in/active-alarm.controller';
import { AlarmService } from '../src/alarms/application/services/alarm.service';
import { ActiveAlarm } from '../src/alarms/domain/models/active-alarm.model';

const mockAlarmService = {
  getActiveAlarms: jest.fn(),
  resolveActiveAlarm: jest.fn(),
};

const mockActiveAlarm = new ActiveAlarm(
  'active-id-1', 'alarm-id-1', 'Temperatura soglia',
  'Temperatura oltre soglia', new Date('2024-01-01'), null,
);

describe('ActiveAlarmController', () => {
  let controller: ActiveAlarmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActiveAlarmController],
      providers: [{ provide: AlarmService, useValue: mockAlarmService }],
    }).compile();

    controller = module.get<ActiveAlarmController>(ActiveAlarmController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getActiveAlarms', () => {
    it('dovrebbe restituire la lista di ActiveAlarmDto', async () => {
      mockAlarmService.getActiveAlarms.mockResolvedValue([mockActiveAlarm]);
      const result = await controller.getActiveAlarms();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('active-id-1');
      expect(result[0].resolvedAt).toBeNull();
    });

    it('dovrebbe restituire lista vuota se non ci sono allarmi attivi', async () => {
      mockAlarmService.getActiveAlarms.mockResolvedValue([]);
      const result = await controller.getActiveAlarms();
      expect(result).toEqual([]);
    });
  });

  describe('resolveActiveAlarm', () => {
    it("dovrebbe chiamare il service con l'id corretto", async () => {
      mockAlarmService.resolveActiveAlarm.mockResolvedValue(undefined);
      await controller.resolveActiveAlarm('active-id-1');
      expect(mockAlarmService.resolveActiveAlarm).toHaveBeenCalledWith('active-id-1');
    });
  });
});