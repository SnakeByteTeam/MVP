import { Inject, Injectable, Logger } from '@nestjs/common';
import { AlarmRule } from '../../domain/models/alarm-rule.model';
import {
  GET_ALL_ALARM_RULES_PORT,
  GetAllAlarmRulesPort,
} from '../ports/out/get-all-alarm-rules.port';
import {
  GET_ALARM_RULE_BY_ID_PORT,
  GetAlarmRuleByIdPort,
} from '../ports/out/get-alarm-rule-by-id.port';
import { CreateAlarmRuleUseCase } from '../ports/in/create-alarm-rule.use-case';
import { GetAllAlarmRulesUseCase } from '../ports/in/get-all-alarm-rules.use-case';
import { GetAlarmRuleByIdUseCase } from '../ports/in/get-alarm-rule-by-id.use-case';
import { UpdateAlarmRuleUseCase } from '../ports/in/update-alarm-rule.use-case';
import { DeleteAlarmRuleUseCase } from '../ports/in/delete-alarm-rule.use-case';
import { CreateAlarmRuleCmd } from '../commands/create-alarm-rule.cmd';
import { GetAlarmRuleByIdCmd } from '../commands/get-alarm-rule-by-id-cmd';
import { UpdateAlarmRuleCmd } from '../commands/update-alarm-rule.cmd';
import { DeleteAlarmRuleCmd } from '../commands/delete-alarm-rule-cmd';
import {
  DELETE_ALARM_RULE_PORT,
  DeleteAlarmRulePort,
} from '../ports/out/delete-alarm-rule.port';
import {
  CREATE_ALARM_RULE_PORT,
  CreateAlarmRulePort,
} from '../ports/out/create-alarm-rule.port';
import {
  UPDATE_ALARM_RULE_PORT,
  UpdateAlarmRulePort,
} from '../ports/out/update-alarm-rule.port';
import { CheckAlarmRuleUseCase } from '../ports/in/check-alarm-rule-use-case.interface';
import { CheckAlarmRuleCmd } from '../commands/check-alarm-rule-cmd';
import {
  CHECK_ALARM_RULE_PORT,
  CheckAlarmRulePort,
} from '../ports/out/check-alarm-rule-port.interface';
import {
  CREATE_ALARM_EVENT_PORT,
  CreateAlarmEventPort,
} from '../ports/out/create-alarm-event-port.interface';
import { CreateAlarmEventCmd } from '../commands/create-alarm-event-cmd';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';
import { CheckAlarm } from '../../domain/models/check-alarm';

@Injectable()
export class AlarmRuleService
  implements
    CreateAlarmRuleUseCase,
    GetAlarmRuleByIdUseCase,
    GetAllAlarmRulesUseCase,
    UpdateAlarmRuleUseCase,
    DeleteAlarmRuleUseCase,
    CheckAlarmRuleUseCase
{
  private readonly logger = new Logger(AlarmRuleService.name);

  constructor(
    private readonly emitter: EventEmitter2,
    @Inject(GET_ALL_ALARM_RULES_PORT)
    private readonly getAllAlarmRulesPort: GetAllAlarmRulesPort,

    @Inject(GET_ALARM_RULE_BY_ID_PORT)
    private readonly getAlarmRuleByIdPort: GetAlarmRuleByIdPort,

    @Inject(CREATE_ALARM_RULE_PORT)
    private readonly createAlarmRulePort: CreateAlarmRulePort,

    @Inject(UPDATE_ALARM_RULE_PORT)
    private readonly updateAlarmRulePort: UpdateAlarmRulePort,

    @Inject(DELETE_ALARM_RULE_PORT)
    private readonly deleteAlarmRulePort: DeleteAlarmRulePort,

    @Inject(CHECK_ALARM_RULE_PORT)
    private readonly checkAlarmRulePort: CheckAlarmRulePort,

    @Inject(CREATE_ALARM_EVENT_PORT)
    private readonly createAlarmEventPort: CreateAlarmEventPort,
  ) {}

  async getAllAlarmRules(): Promise<AlarmRule[]> {
    return await this.getAllAlarmRulesPort.getAllAlarmRules();
  }

  async getAlarmRuleById(req: GetAlarmRuleByIdCmd): Promise<AlarmRule | null> {
    return await this.getAlarmRuleByIdPort.getAlarmRuleById(req);
  }

  async createAlarmRule(cmd: CreateAlarmRuleCmd): Promise<AlarmRule> {
    return await this.createAlarmRulePort.createAlarmRule(cmd);
  }

  async updateAlarmRule(cmd: UpdateAlarmRuleCmd): Promise<AlarmRule> {
    return await this.updateAlarmRulePort.updateAlarmRule(cmd);
  }

  async deleteAlarmRule(req: DeleteAlarmRuleCmd): Promise<void> {
    return await this.deleteAlarmRulePort.deleteAlarmRule(req);
  }

  async checkAlarmRule(req: CheckAlarmRuleCmd): Promise<void> {
    this.logger.log(
      `[checkAlarmRule] Start datapointId=${req.datapointId} value=${req.value} activationTime=${req.activationTime.toISOString()}`,
    );

    const checkAlarm = await this.checkAlarmRulePort.checkAlarmRule(req);

    if (!checkAlarm) {
      this.logger.log(
        `[checkAlarmRule] No matching armed alarm rule for datapointId=${req.datapointId}`,
      );
      return;
    }

    this.logger.log(
      `[checkAlarmRule] Match found alarmRuleId=${checkAlarm.alarm_rule_id} wardId=${checkAlarm.ward_id}`,
    );

    const alarmEventId = await this.createAlarmEventPort.createAlarmEvent(
      new CreateAlarmEventCmd(checkAlarm.alarm_rule_id, req.activationTime),
    );

    this.logger.log(
      `[checkAlarmRule] Alarm event created alarmEventId=${alarmEventId}`,
    );

    const checkAlarmWithEventId = new CheckAlarm(
      checkAlarm.alarm_rule_id,
      checkAlarm.ward_id,
      alarmEventId,
    );

    const checkAlarmDto: CheckAlarmRuleResDto =
      CheckAlarmRuleResDto.fromDomain(checkAlarmWithEventId);

    this.emitter.emit('alarm.activated', checkAlarmDto);
    this.logger.log(
      `[checkAlarmRule] Event emitted alarm.activated alarmEventId=${checkAlarmDto.alarmEventId}`,
    );
  }
}
