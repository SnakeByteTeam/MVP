import { Test, TestingModule } from '@nestjs/testing';
import { AlarmRulesService } from 'src/alarms/application/services/alarm-rules.service';
import { GetAllAlarmRulesPort } from 'src/alarms/application/ports/out/get-all-alarm-rules.port';
import { GetAlarmRuleByIdPort } from 'src/alarms/application/ports/out/get-alarm-rule-by-id.port';
import { CreateAlarmRulePort } from 'src/alarms/application/ports/out/create-alarm-rule.port';
import { UpdateAlarmRulePort } from 'src/alarms/application/ports/out/update-alarm-rule.port';
import { DeleteAlarmRulePort } from 'src/alarms/application/ports/out/delete-alarm-rule.port';
import { CheckAlarmRulePort } from 'src/alarms/application/ports/out/check-alarm-rule-port.interface';
import { CreateAlarmEventPort } from 'src/alarms/application/ports/out/create-alarm-event-port.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlarmRule } from 'src/alarms/domain/models/alarm-rule.model';
import { AlarmPriority } from 'src/alarms/domain/models/alarm-priority.enum';
import { CreateAlarmRuleCmd } from 'src/alarms/application/commands/create-alarm-rule.cmd';
import { GetAlarmRuleByIdCmd } from 'src/alarms/application/commands/get-alarm-rule-by-id-cmd';
import { UpdateAlarmRuleCmd } from 'src/alarms/application/commands/update-alarm-rule.cmd';
import { DeleteAlarmRuleCmd } from 'src/alarms/application/commands/delete-alarm-rule-cmd';
import { CheckAlarmRuleCmd } from 'src/alarms/application/commands/check-alarm-rule-cmd';
import { CheckAlarm } from 'src/alarms/domain/models/check-alarm';

describe('AlarmRulesService', () => {
  let service: AlarmRulesService;
  let mockGetAllAlarmRulesPort: jest.Mocked<GetAllAlarmRulesPort>;
  let mockGetAlarmRuleByIdPort: jest.Mocked<GetAlarmRuleByIdPort>;
  let mockCreateAlarmRulePort: jest.Mocked<CreateAlarmRulePort>;
  let mockUpdateAlarmRulePort: jest.Mocked<UpdateAlarmRulePort>;
  let mockDeleteAlarmRulePort: jest.Mocked<DeleteAlarmRulePort>;
  let mockCheckAlarmRulePort: jest.Mocked<CheckAlarmRulePort>;
  let mockCreateAlarmEventPort: jest.Mocked<CreateAlarmEventPort>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    mockGetAllAlarmRulesPort = {
      getAllAlarmRules: jest.fn(),
    };

    mockGetAlarmRuleByIdPort = {
      getAlarmRuleById: jest.fn(),
    };

    mockCreateAlarmRulePort = {
      createAlarmRule: jest.fn(),
    };

    mockUpdateAlarmRulePort = {
      updateAlarmRule: jest.fn(),
    };

    mockDeleteAlarmRulePort = {
      deleteAlarmRule: jest.fn(),
    };

    mockCheckAlarmRulePort = {
      checkAlarmRule: jest.fn(),
    };

    mockCreateAlarmEventPort = {
      createAlarmEvent: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlarmRulesService,
        {
          provide: 'GET_ALL_ALARM_RULES_PORT',
          useValue: mockGetAllAlarmRulesPort,
        },
        {
          provide: 'GET_ALARM_RULE_BY_ID_PORT',
          useValue: mockGetAlarmRuleByIdPort,
        },
        {
          provide: 'CREATE_ALARM_RULE_PORT',
          useValue: mockCreateAlarmRulePort,
        },
        {
          provide: 'UPDATE_ALARM_RULE_PORT',
          useValue: mockUpdateAlarmRulePort,
        },
        {
          provide: 'DELETE_ALARM_RULE_PORT',
          useValue: mockDeleteAlarmRulePort,
        },
        {
          provide: 'CHECK_ALARM_RULE_PORT',
          useValue: mockCheckAlarmRulePort,
        },
        {
          provide: 'CREATE_ALARM_EVENT_PORT',
          useValue: mockCreateAlarmEventPort,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<AlarmRulesService>(AlarmRulesService);
  });

  describe('getAllAlarmRules', () => {
    it('should return all alarm rules', async () => {
      const mockRules = [
        new AlarmRule(
          'rule-1',
          'Ward A',
          'High Temp',
          '>',
          '38.5',
          AlarmPriority.WHITE,
          new Date(),
          new Date(),
          true,
        ),
        new AlarmRule(
          'rule-2',
          'Ward B',
          'Low O2',
          '<',
          '90',
          AlarmPriority.WHITE,
          new Date(),
          new Date(),
          true,
        ),
      ];

      mockGetAllAlarmRulesPort.getAllAlarmRules.mockResolvedValue(mockRules);

      const result = await service.getAllAlarmRules();

      expect(result).toEqual(mockRules);
      expect(mockGetAllAlarmRulesPort.getAllAlarmRules).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no rules exist', async () => {
      mockGetAllAlarmRulesPort.getAllAlarmRules.mockResolvedValue([]);

      const result = await service.getAllAlarmRules();

      expect(result).toEqual([]);
    });

    it('should propagate port errors', async () => {
      const error = new Error('Database error');
      mockGetAllAlarmRulesPort.getAllAlarmRules.mockRejectedValue(error);

      await expect(service.getAllAlarmRules()).rejects.toThrow(error);
    });
  });

  describe('getAlarmRuleById', () => {
    it('should return alarm rule by id', async () => {
      const mockRule = new AlarmRule(
        'rule-1',
        'Ward A',
        'High Temp',
        '>',
        '38.5',
        AlarmPriority.WHITE,
        new Date(),
        new Date(),
        true,
      );
      const cmd = new GetAlarmRuleByIdCmd('rule-1');

      mockGetAlarmRuleByIdPort.getAlarmRuleById.mockResolvedValue(mockRule);

      const result = await service.getAlarmRuleById(cmd);

      expect(result).toEqual(mockRule);
      expect(mockGetAlarmRuleByIdPort.getAlarmRuleById).toHaveBeenCalledWith(cmd);
    });

    it('should return null when rule not found', async () => {
      const cmd = new GetAlarmRuleByIdCmd('non-existent');

      mockGetAlarmRuleByIdPort.getAlarmRuleById.mockResolvedValue(null);

      const result = await service.getAlarmRuleById(cmd);

      expect(result).toBeNull();
    });

    it('should propagate port errors', async () => {
      const cmd = new GetAlarmRuleByIdCmd('rule-1');
      const error = new Error('Database error');

      mockGetAlarmRuleByIdPort.getAlarmRuleById.mockRejectedValue(error);

      await expect(service.getAlarmRuleById(cmd)).rejects.toThrow(error);
    });
  });

  describe('createAlarmRule', () => {
    it('should create alarm rule successfully', async () => {
      const cmd = new CreateAlarmRuleCmd(
        'Ward A',
        'dp',
        'dev',
        'pl',
        AlarmPriority.WHITE,
        '>',
        '38.5',
        '10:30',
        '22:30'
      );

          const armingDate = new Date();
    armingDate.setHours(10, 30, 0, 0);
    const dearmingDate = new Date();
    dearmingDate.setHours(22, 30, 0, 0);

      const mockRule = new AlarmRule(
        'rule-1',
        'Ward A',
        'High Temp',
        '>',
        '38.5',
        AlarmPriority.WHITE,
        armingDate,
        dearmingDate,
        true,
      );

      mockCreateAlarmRulePort.createAlarmRule.mockResolvedValue(mockRule);

      const result = await service.createAlarmRule(cmd);

      expect(result).toEqual(mockRule);
      expect(mockCreateAlarmRulePort.createAlarmRule).toHaveBeenCalledWith(cmd);
    });

    it('should propagate port errors', async () => {
      const cmd = new CreateAlarmRuleCmd(
        'Ward A',
        'dp',
        'dev',
        'pl',
        AlarmPriority.WHITE,
        '>',
        '38.5',
        '10:30',
        '22:30'
      );
      const error = new Error('Database error');

      mockCreateAlarmRulePort.createAlarmRule.mockRejectedValue(error);

      await expect(service.createAlarmRule(cmd)).rejects.toThrow(error);
    });
  });

  describe('updateAlarmRule', () => {
    it('should update alarm rule successfully', async () => {
    const cmd = new UpdateAlarmRuleCmd(
      'rule-1',
      'Ward A Updated',
      AlarmPriority.WHITE,
      '>',
      '39.5',
      '10:30',
      '22:30',
      false,
    );

    const armingDate = new Date();
    armingDate.setHours(10, 30, 0, 0);
    const dearmingDate = new Date();
    dearmingDate.setHours(22, 30, 0, 0);

    const mockUpdatedRule = new AlarmRule(
      'rule-1',
      'Ward A Updated',
      'Updated Rule',
      '>',
      '39.5',
      AlarmPriority.WHITE,
      armingDate,
      dearmingDate,
      false,
    );

      mockUpdateAlarmRulePort.updateAlarmRule.mockResolvedValue(
        mockUpdatedRule,
      );

      const result = await service.updateAlarmRule(cmd);

      expect(result).toEqual(mockUpdatedRule);
      expect(mockUpdateAlarmRulePort.updateAlarmRule).toHaveBeenCalledWith(cmd);
    });

    it('should propagate port errors', async () => {
      const cmd = new UpdateAlarmRuleCmd(
        'rule-1',
        'Ward A',
        AlarmPriority.WHITE,
        '>',
        '38.5',
        '10:30',
        '22:30',
        true,
      );
      const error = new Error('Database error');

      mockUpdateAlarmRulePort.updateAlarmRule.mockRejectedValue(error);

      await expect(service.updateAlarmRule(cmd)).rejects.toThrow(error);
    });
  });

  describe('deleteAlarmRule', () => {
    it('should delete alarm rule successfully', async () => {
      const cmd = new DeleteAlarmRuleCmd('rule-1');

      mockDeleteAlarmRulePort.deleteAlarmRule.mockResolvedValue(undefined);

      await service.deleteAlarmRule(cmd);

      expect(mockDeleteAlarmRulePort.deleteAlarmRule).toHaveBeenCalledWith(cmd);
    });

    it('should propagate port errors', async () => {
      const cmd = new DeleteAlarmRuleCmd('rule-1');
      const error = new Error('Database error');

      mockDeleteAlarmRulePort.deleteAlarmRule.mockRejectedValue(error);

      await expect(service.deleteAlarmRule(cmd)).rejects.toThrow(error);
    });
  });

  describe('checkAlarmRule', () => {
    it('should check alarm rule and emit event when alarm matches', async () => {
      const activationTime = new Date('2026-04-12T10:00:00Z');
      const cmd = new CheckAlarmRuleCmd('datapoint-1', '38', activationTime);

      const checkAlarmResult = new CheckAlarm('rule-1', 5, 'event-1');

      mockCheckAlarmRulePort.checkAlarmRule.mockResolvedValue(
        checkAlarmResult,
      );
      mockCreateAlarmEventPort.createAlarmEvent.mockResolvedValue('event-1');

      await service.checkAlarmRule(cmd);

      expect(mockCheckAlarmRulePort.checkAlarmRule).toHaveBeenCalledWith(cmd);
      expect(mockCreateAlarmEventPort.createAlarmEvent).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'alarm.activated',
        expect.any(Object),
      );
    });

    it('should not emit event when no matching alarm rule found', async () => {
      const activationTime = new Date('2026-04-12T10:00:00Z');
      const cmd = new CheckAlarmRuleCmd('datapoint-1', "36.5", activationTime);

      mockCheckAlarmRulePort.checkAlarmRule.mockResolvedValue(null);

      await service.checkAlarmRule(cmd);

      expect(mockCheckAlarmRulePort.checkAlarmRule).toHaveBeenCalledWith(cmd);
      expect(mockCreateAlarmEventPort.createAlarmEvent).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should propagate port errors', async () => {
      const cmd = new CheckAlarmRuleCmd(
        'datapoint-1',
        "38.6",
        new Date('2026-04-12T10:00:00Z'),
      );
      const error = new Error('Database error');

      mockCheckAlarmRulePort.checkAlarmRule.mockRejectedValue(error);

      await expect(service.checkAlarmRule(cmd)).rejects.toThrow(error);
    });

    it('should propagate createAlarmEvent errors', async () => {
      const activationTime = new Date('2026-04-12T10:00:00Z');
      const cmd = new CheckAlarmRuleCmd('datapoint-1', '38.6', activationTime);

      const checkAlarmResult = new CheckAlarm('rule-1', 5, 'event-1');

      mockCheckAlarmRulePort.checkAlarmRule.mockResolvedValue(
        checkAlarmResult,
      );
      mockCreateAlarmEventPort.createAlarmEvent.mockRejectedValue(
        new Error('Event creation failed'),
      );

      await expect(service.checkAlarmRule(cmd)).rejects.toThrow(
        'Event creation failed',
      );
    });

    it('should emit alarm.activated event with correct data', async () => {
      const activationTime = new Date('2026-04-12T10:00:00Z');
      const cmd = new CheckAlarmRuleCmd('datapoint-1', '38.6', activationTime);

      const checkAlarmResult = new CheckAlarm('rule-1', 5, 'event-1');

      mockCheckAlarmRulePort.checkAlarmRule.mockResolvedValue(
        checkAlarmResult,
      );
      mockCreateAlarmEventPort.createAlarmEvent.mockResolvedValue('event-1');

      await service.checkAlarmRule(cmd);

      const emittedData = (mockEventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(emittedData).toBeDefined();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'alarm.activated',
        emittedData,
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple sequential operations', async () => {
      const mockRule = new AlarmRule(
        'rule-1',
        'Ward A',
        'High Temp',
        '>',
        '38.5',
        AlarmPriority.WHITE,
        new Date(),
        new Date(),
        true,
      );

      mockGetAllAlarmRulesPort.getAllAlarmRules.mockResolvedValue([mockRule]);
      mockGetAlarmRuleByIdPort.getAlarmRuleById.mockResolvedValue(mockRule);

      const allRules = await service.getAllAlarmRules();
      const singleRule = await service.getAlarmRuleById(
        new GetAlarmRuleByIdCmd('rule-1'),
      );

      expect(allRules).toHaveLength(1);
      expect(singleRule).toEqual(mockRule);
    });
  });
});