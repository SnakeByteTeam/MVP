import { Test, TestingModule } from '@nestjs/testing';
import { UserGuard } from 'src/guard/user/user.guard';
import { AdminGuard } from 'src/guard/admin/admin.guard';
import { JwtService } from '@nestjs/jwt';
import { AlarmRulesController } from 'src/alarms/adapters/in/alarm-rules.controller';
import { CREATE_ALARM_RULE_USE_CASE } from 'src/alarms/application/ports/in/create-alarm-rule.use-case';
import { DELETE_ALARM_RULE_USE_CASE } from 'src/alarms/application/ports/in/delete-alarm-rule.use-case';
import { GET_ALARM_RULE_BY_ID_USE_CASE } from 'src/alarms/application/ports/in/get-alarm-rule-by-id.use-case';
import { GET_ALL_ALARM_RULES_USE_CASE } from 'src/alarms/application/ports/in/get-all-alarm-rules.use-case';
import { UPDATE_ALARM_RULE_USE_CASE } from 'src/alarms/application/ports/in/update-alarm-rule.use-case';

describe('AlarmRulesController', () => {
  let controller: AlarmRulesController;

  const mockCreateAlarmUseCase = {
    createAlarmRule: jest.fn(),
  };

  const mockDeleteAlarmRuleUseCase = {
    deleteAlarmRule: jest.fn(),
  };

  const mockGetAlarmRuleByIdUseCase = {
    getAlarmRuleById: jest.fn(),
  };

  const mockGetAllAlarmRulesUseCase = {
    getAllAlarmRules: jest.fn(),
  };

  const mockUpdateAlarmRuleUseCase = {
    updateAlarmRule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlarmRulesController],
      providers: [
        {
          provide: CREATE_ALARM_RULE_USE_CASE,
          useValue: mockCreateAlarmUseCase,
        },
        {
          provide: DELETE_ALARM_RULE_USE_CASE,
          useValue: mockDeleteAlarmRuleUseCase,
        },
        {
            provide: GET_ALARM_RULE_BY_ID_USE_CASE,
            useValue: mockGetAlarmRuleByIdUseCase
        },
        {
          provide: GET_ALL_ALARM_RULES_USE_CASE,
          useValue: mockGetAllAlarmRulesUseCase,
        },
        { provide: UPDATE_ALARM_RULE_USE_CASE, useValue: mockUpdateAlarmRuleUseCase },
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

    controller = module.get<AlarmRulesController>(AlarmRulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createAlarmUseCase.createAlarmRule', async () => {
    const req = {
        name: '',
        datapointId: '',
        deviceId: '',
        plantId: '',
        priority: 1,
        thresholdOperator: '',
        thresholdValue: '',
        armingTime: '',
        dearmingTime: ''
    }
    await controller.createAlarmRule(req);
    expect(mockCreateAlarmUseCase.createAlarmRule).toHaveBeenCalled();
  });

  it('should call deleteAlarmRuleUseCase.deleteAlarmRule', async () => {
    await controller.deleteAlarmRule('id');
    expect(
      mockDeleteAlarmRuleUseCase.deleteAlarmRule,
    ).toHaveBeenCalled();
  });

  it('should call getAlarmRuleByIdUseCase.getAlarmRuleById', async () => {
    await controller.getAlarmRuleById('');
    expect(mockGetAlarmRuleByIdUseCase.getAlarmRuleById).toHaveBeenCalled();
  });

  it('should call getAllAlarmRulesUseCase.getAllAlarmRules', async () => {
    await controller.getAllAlarmRules();
    expect(mockGetAllAlarmRulesUseCase.getAllAlarmRules).toHaveBeenCalled();
  });

    it('should call updateAlarmRuleUseCase.updateAlarmRule with correct args', async () => {
        const req = {
            name: '',
            priority: 1,
            thresholdOperator: '',
            thresholdValue: '',
            armingTime: '',
            dearmingTime: '',
            isArmed: true
        }

        await controller.updateAlarmRule('', req);

        expect(mockUpdateAlarmRuleUseCase.updateAlarmRule).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '',
                name: '',
                priority: 1,
                thresholdOperator: '',
                thresholdValue: '',
                armingTime: '',
                dearmingTime: '',
                isArmed: true
            }),
        );
    });
});