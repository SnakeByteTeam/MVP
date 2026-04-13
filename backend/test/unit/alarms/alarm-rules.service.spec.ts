import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlarmRulesService } from '../../../src/alarms/application/services/alarm-rules.service';
import { AlarmPriority } from '../../../src/alarms/domain/models/alarm-priority.enum';
import {
  GET_ALL_ALARM_RULES_PORT,
  GetAllAlarmRulesPort,
} from '../../../src/alarms/application/ports/out/get-all-alarm-rules.port';
import {
  GET_ALARM_RULE_BY_ID_PORT,
  GetAlarmRuleByIdPort,
} from '../../../src/alarms/application/ports/out/get-alarm-rule-by-id.port';
import {
  CREATE_ALARM_RULE_PORT,
  CreateAlarmRulePort,
} from '../../../src/alarms/application/ports/out/create-alarm-rule.port';
import {
  UPDATE_ALARM_RULE_PORT,
  UpdateAlarmRulePort,
} from '../../../src/alarms/application/ports/out/update-alarm-rule.port';
import {
  DELETE_ALARM_RULE_PORT,
  DeleteAlarmRulePort,
} from '../../../src/alarms/application/ports/out/delete-alarm-rule.port';
import {
  CHECK_ALARM_RULE_PORT,
  CheckAlarmRulePort,
} from '../../../src/alarms/application/ports/out/check-alarm-rule-port.interface';
import {
  CREATE_ALARM_EVENT_PORT,
  CreateAlarmEventPort,
} from '../../../src/alarms/application/ports/out/create-alarm-event-port.interface';
import { CreateAlarmRuleCmd } from '../../../src/alarms/application/commands/create-alarm-rule.cmd';
import { GetAlarmRuleByIdCmd } from '../../../src/alarms/application/commands/get-alarm-rule-by-id-cmd';
import { UpdateAlarmRuleCmd } from '../../../src/alarms/application/commands/update-alarm-rule.cmd';
import { DeleteAlarmRuleCmd } from '../../../src/alarms/application/commands/delete-alarm-rule-cmd';
import { CheckAlarmRuleCmd } from '../../../src/alarms/application/commands/check-alarm-rule-cmd';
import { CheckAlarm } from '../../../src/alarms/domain/models/check-alarm';

describe('AlarmRulesService', () => {
  let service: AlarmRulesService;
  let getAllAlarmRulesPort: jest.Mocked<GetAllAlarmRulesPort>;
  let getAlarmRuleByIdPort: jest.Mocked<GetAlarmRuleByIdPort>;
  let createAlarmRulePort: jest.Mocked<CreateAlarmRulePort>;
  let updateAlarmRulePort: jest.Mocked<UpdateAlarmRulePort>;
  let deleteAlarmRulePort: jest.Mocked<DeleteAlarmRulePort>;
  let checkAlarmRulePort: jest.Mocked<CheckAlarmRulePort>;
  let createAlarmEventPort: jest.Mocked<CreateAlarmEventPort>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlarmRulesService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: GET_ALL_ALARM_RULES_PORT,
          useValue: {
            getAllAlarmRules: jest.fn(),
          },
        },
        {
          provide: GET_ALARM_RULE_BY_ID_PORT,
          useValue: {
            getAlarmRuleById: jest.fn(),
          },
        },
        {
          provide: CREATE_ALARM_RULE_PORT,
          useValue: {
            createAlarmRule: jest.fn(),
          },
        },
        {
          provide: UPDATE_ALARM_RULE_PORT,
          useValue: {
            updateAlarmRule: jest.fn(),
          },
        },
        {
          provide: DELETE_ALARM_RULE_PORT,
          useValue: {
            deleteAlarmRule: jest.fn(),
          },
        },
        {
          provide: CHECK_ALARM_RULE_PORT,
          useValue: {
            checkAlarmRule: jest.fn(),
          },
        },
        {
          provide: CREATE_ALARM_EVENT_PORT,
          useValue: {
            createAlarmEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AlarmRulesService>(AlarmRulesService);
    getAllAlarmRulesPort = module.get(GET_ALL_ALARM_RULES_PORT);
    getAlarmRuleByIdPort = module.get(GET_ALARM_RULE_BY_ID_PORT);
    createAlarmRulePort = module.get(CREATE_ALARM_RULE_PORT);
    updateAlarmRulePort = module.get(UPDATE_ALARM_RULE_PORT);
    deleteAlarmRulePort = module.get(DELETE_ALARM_RULE_PORT);
    checkAlarmRulePort = module.get(CHECK_ALARM_RULE_PORT);
    createAlarmEventPort = module.get(CREATE_ALARM_EVENT_PORT);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('getAllAlarmRules', () => {
    it('should return all alarm rules', async () => {
      const mockRules: any[] = [
        {
          id: 'rule-001',
          position: 'sensor-room1-device1',
          name: 'Temperature Alert',
          thresholdOperator: '>',
          thresholdValue: '28',
          priority: AlarmPriority.RED,
          armingTime: new Date('2024-01-01T08:00:00Z'),
          dearmingTime: new Date('2024-01-01T17:00:00Z'),
          isArmed: true,
        },
      ];

      getAllAlarmRulesPort.getAllAlarmRules.mockResolvedValue(mockRules);

      const result = await service.getAllAlarmRules();

      expect(result).toEqual(mockRules);
      expect(getAllAlarmRulesPort.getAllAlarmRules).toHaveBeenCalled();
    });

    it('should return empty list when no rules exist', async () => {
      getAllAlarmRulesPort.getAllAlarmRules.mockResolvedValue([]);

      const result = await service.getAllAlarmRules();

      expect(result).toEqual([]);
    });
  });

  describe('getAlarmRuleById', () => {
    it('should return alarm rule when found', async () => {
      const mockRule: any = {
        id: 'rule-001',
        position: 'sensor-room1-device1',
        name: 'Temperature Alert',
        thresholdOperator: '>',
        thresholdValue: '28',
        priority: AlarmPriority.RED,
        armingTime: new Date('2024-01-01T08:00:00Z'),
        dearmingTime: new Date('2024-01-01T17:00:00Z'),
        isArmed: true,
      };
      const cmd = new GetAlarmRuleByIdCmd('rule-001');

      getAlarmRuleByIdPort.getAlarmRuleById.mockResolvedValue(mockRule);

      const result = await service.getAlarmRuleById(cmd);

      expect(result).toEqual(mockRule);
      expect(getAlarmRuleByIdPort.getAlarmRuleById).toHaveBeenCalledWith(cmd);
    });

    it('should return null when alarm rule not found', async () => {
      const cmd = new GetAlarmRuleByIdCmd('nonexistent-id');

      getAlarmRuleByIdPort.getAlarmRuleById.mockResolvedValue(null);

      const result = await service.getAlarmRuleById(cmd);

      expect(result).toBeNull();
    });
  });

  describe('createAlarmRule', () => {
    it('should create and return new alarm rule', async () => {
      const cmd = new CreateAlarmRuleCmd(
        'Temperature Alert',
        'tempSensor1',
        'device-001',
        'plant-001',
        AlarmPriority.RED,
        '>',
        '28',
        '08:00',
        '17:00',
      );
      const mockCreatedRule: any = {
        id: 'rule-001',
        position: 'sensor-room1-device1',
        name: cmd.name,
        thresholdOperator: cmd.thresholdOperator,
        thresholdValue: cmd.thresholdValue,
        priority: AlarmPriority.RED,
        armingTime: cmd.armingTime,
        dearmingTime: cmd.dearmingTime,
        isArmed: true,
      };

      createAlarmRulePort.createAlarmRule.mockResolvedValue(mockCreatedRule);

      const result = await service.createAlarmRule(cmd);

      expect(result).toEqual(mockCreatedRule);
      expect(createAlarmRulePort.createAlarmRule).toHaveBeenCalledWith(cmd);
    });
  });

  describe('updateAlarmRule', () => {
    it('should update and return modified alarm rule', async () => {
      const cmd = new UpdateAlarmRuleCmd(
        'rule-001',
        'Updated Alert',
        AlarmPriority.GREEN,
        '<',
        '15',
        '08:00',
        '17:00',
        false,
      );
      const mockUpdatedRule: any = {
        id: 'rule-001',
        position: 'sensor-room1-device1',
        name: 'Updated Alert',
        thresholdOperator: '<',
        thresholdValue: '15',
        priority: AlarmPriority.GREEN,
        armingTime: new Date('2024-01-01T08:00:00Z'),
        dearmingTime: new Date('2024-01-01T17:00:00Z'),
        isArmed: false,
      };

      updateAlarmRulePort.updateAlarmRule.mockResolvedValue(mockUpdatedRule);

      const result = await service.updateAlarmRule(cmd);

      expect(result).toEqual(mockUpdatedRule);
      expect(updateAlarmRulePort.updateAlarmRule).toHaveBeenCalledWith(cmd);
    });
  });

  describe('deleteAlarmRule', () => {
    it('should delete alarm rule', async () => {
      const cmd = new DeleteAlarmRuleCmd('rule-001');

      deleteAlarmRulePort.deleteAlarmRule.mockResolvedValue(undefined);

      await service.deleteAlarmRule(cmd);

      expect(deleteAlarmRulePort.deleteAlarmRule).toHaveBeenCalledWith(cmd);
    });
  });

  describe('checkAlarmRule', () => {
    it('should emit alarm.activated event when rule matches', async () => {
      const cmd = new CheckAlarmRuleCmd(
        'sensor001',
        '30',
        new Date('2024-01-15T10:30:00Z'),
      );
      const checkAlarm = new CheckAlarm('rule-001', 123, 'event-001');

      checkAlarmRulePort.checkAlarmRule.mockResolvedValue(checkAlarm);
      createAlarmEventPort.createAlarmEvent.mockResolvedValue('event-001');

      await service.checkAlarmRule(cmd);

      expect(checkAlarmRulePort.checkAlarmRule).toHaveBeenCalledWith(cmd);
      expect(createAlarmEventPort.createAlarmEvent).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('alarm.activated', expect.any(Object));
    });

    it('should not emit event when no rule matches', async () => {
      const cmd = new CheckAlarmRuleCmd(
        'sensor001',
        '30',
        new Date('2024-01-15T10:30:00Z'),
      );

      checkAlarmRulePort.checkAlarmRule.mockResolvedValue(null);

      await service.checkAlarmRule(cmd);

      expect(checkAlarmRulePort.checkAlarmRule).toHaveBeenCalledWith(cmd);
      expect(createAlarmEventPort.createAlarmEvent).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should handle multiple alarm checks with different results', async () => {
      // First check: match found
      const cmd1 = new CheckAlarmRuleCmd(
        'sensor001',
        '30',
        new Date('2024-01-15T10:30:00Z'),
      );
      const checkAlarm1 = new CheckAlarm('rule-001', 123, 'event-001');
      checkAlarmRulePort.checkAlarmRule.mockResolvedValueOnce(checkAlarm1);
      createAlarmEventPort.createAlarmEvent.mockResolvedValueOnce('event-001');

      await service.checkAlarmRule(cmd1);

      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);

      // Second check: no match
      const cmd2 = new CheckAlarmRuleCmd(
        'sensor002',
        '20',
        new Date('2024-01-15T10:35:00Z'),
      );
      checkAlarmRulePort.checkAlarmRule.mockResolvedValueOnce(null);

      await service.checkAlarmRule(cmd2);

      expect(eventEmitter.emit).toHaveBeenCalledTimes(1); // Still only 1 call
    });
  });
});
