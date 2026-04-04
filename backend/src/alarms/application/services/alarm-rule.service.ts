import { Inject, Injectable } from '@nestjs/common';

import { AlarmRule } from '../../domain/models/alarm-rule.model';

import {
  GET_ALL_ALARMS_PORT,
  GetAllAlarmsPort,
} from '../ports/out/get-all-alarm-rules.port';
import {
  GET_ALARM_BY_ID_PORT,
  GetAlarmByIdPort,
} from '../ports/out/get-alarm-rule-by-id.port';
// import {
//   GET_ALL_ALARMS_BY_REQUEST_PORT,
//   GetAllAlarmsByRequestPort,
// } from '../ports/out/get-all-alarms-by-request.port';
import {
  CREATE_ALARM_PORT,
  CreateAlarmPort,
} from '../ports/out/create-alarm-rule.port';
import {
  UPDATE_ALARM_PORT,
  UpdateAlarmPort,
} from '../ports/out/update-alarm.port';
import {
  DELETE_ALARM_PORT,
  DeleteAlarmPort,
} from '../ports/out/delete-alarm-rule.port';

import { CreateAlarmRuleUseCase } from '../ports/in/create-alarm-rule.use-case';
import { GetAllAlarmRulesUseCase } from '../ports/in/get-all-alarm-rules.use-case';
import { GetAlarmRuleUseCase } from '../ports/in/get-alarm-rule.use-case';
import { UpdateAlarmRuleUseCase } from '../ports/in/update-alarm-rule.use-case';
import { DeleteAlarmRuleUseCase } from '../ports/in/delete-alarm-rule.use-case';

import { CreateAlarmRuleCmd } from '../commands/create-alarm-rule.cmd';
import { GetAlarmRuleByIdCmd } from '../commands/get-alarm-rule-by-id-cmd';
import { UpdateAlarmRuleCmd } from '../commands/update-alarm-rule.cmd';
import { DeleteAlarmRuleCmd } from '../commands/delete-alarm-rule-cmd';

@Injectable()
export class AlarmRuleService
  implements
    CreateAlarmRuleUseCase,
    GetAlarmRuleUseCase,
    GetAllAlarmRulesUseCase,
    UpdateAlarmRuleUseCase,
    DeleteAlarmRuleUseCase
{
  constructor(
    @Inject(GET_ALL_ALARMS_PORT)
    private readonly getAllAlarmsPort: GetAllAlarmsPort,

    @Inject(GET_ALARM_BY_ID_PORT)
    private readonly getAlarmByIdPort: GetAlarmByIdPort,

    // @Inject(GET_ALL_ALARMS_BY_REQUEST_PORT)
    // private readonly getAllAlarmsByRequestPort: GetAllAlarmsByRequestPort,

    @Inject(CREATE_ALARM_PORT)
    private readonly createAlarmPort: CreateAlarmPort,

    @Inject(UPDATE_ALARM_PORT)
    private readonly updateAlarmPort: UpdateAlarmPort,

    @Inject(DELETE_ALARM_PORT)
    private readonly deleteAlarmPort: DeleteAlarmPort,
  ) {}

  async getAllAlarmRules(): Promise<AlarmRule[]> {
    return this.getAllAlarmsPort.getAllAlarms();
  }

  async getAlarmRule(req: GetAlarmRuleByIdCmd): Promise<AlarmRule | null> {
    return await this.getAlarmByIdPort.getAlarmById(req);
  }

  async createAlarmRule(cmd: CreateAlarmRuleCmd): Promise<AlarmRule> {
    return await this.createAlarmPort.createAlarm(cmd);
  }

  async updateAlarmRule(cmd: UpdateAlarmRuleCmd): Promise<AlarmRule> {
    return await this.updateAlarmPort.updateAlarm(cmd);
  }

  async deleteAlarmRule(req: DeleteAlarmRuleCmd): Promise<void> {
    return await this.deleteAlarmPort.deleteAlarm(req);
  }
}
