import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { Alarm } from '../../domain/models/alarm.model';
import { ActiveAlarm } from '../../domain/models/active-alarm.model';

import { GET_ALL_ALARMS_PORT, GetAllAlarmsPort } from '../ports/out/get-all-alarms.port';
import { GET_ALARM_BY_ID_PORT, GetAlarmByIdPort } from '../ports/out/get-alarm-by-id.port';
import { GET_ALL_ALARMS_BY_REQUEST_PORT, GetAllAlarmsByRequestPort } from '../ports/out/get-all-alarms-by-request.port';
import { CREATE_ALARM_PORT, CreateAlarmPort } from '../ports/out/create-alarm.port';
import { UPDATE_ALARM_PORT, UpdateAlarmPort } from '../ports/out/update-alarm.port';
import { DELETE_ALARM_PORT, DeleteAlarmPort } from '../ports/out/delete-alarm.port';
import {
  FIND_ALL_ACTIVE_ALARMS_PORT, FindAllActiveAlarmsPort,
  FIND_ACTIVE_ALARM_BY_ID_PORT, FindActiveAlarmByIdPort,
  FIND_ACTIVE_ALARM_BY_RULE_ID_PORT, FindActiveAlarmByRuleIdPort,
  SAVE_ACTIVE_ALARM_PORT, SaveActiveAlarmPort,
  RESOLVE_ACTIVE_ALARM_PORT, ResolveActiveAlarmPort,
} from '../ports/out/find-active-alarms.port';

import { CreateAlarmUseCase } from '../ports/in/create-alarm.use-case';
import { GetAllAlarmsUseCase } from '../ports/in/get-all-alarms.use-case';
import { GetAlarmUseCase } from '../ports/in/get-alarm.use-case';
import { UpdateAlarmUseCase } from '../ports/in/update-alarm.use-case';
import { DeleteAlarmUseCase } from '../ports/in/delete-alarm.use-case';
import { GetActiveAlarmsUseCase } from '../ports/in/get-active-alarms.use-case';
import { ResolveActiveAlarmUseCase } from '../ports/in/resolve-active-alarm.use-case';
import { TriggerActiveAlarmUseCase } from '../ports/in/trigger-active-alarm.use-case';

import { CreateAlarmCmd } from '../commands/create-alarm.cmd';
import { UpdateAlarmCmd } from '../commands/update-alarm.cmd';
import { TriggerActiveAlarmCmd } from '../commands/trigger-active-alarm.cmd';

@Injectable()
export class AlarmService
  implements
  CreateAlarmUseCase,
  GetAllAlarmsUseCase,
  GetAlarmUseCase,
  UpdateAlarmUseCase,
  DeleteAlarmUseCase,
  GetActiveAlarmsUseCase,
  ResolveActiveAlarmUseCase,
  TriggerActiveAlarmUseCase {
  constructor(
    @Inject(GET_ALL_ALARMS_PORT)
    private readonly getAllAlarmsPort: GetAllAlarmsPort,

    @Inject(GET_ALARM_BY_ID_PORT)
    private readonly getAlarmByIdPort: GetAlarmByIdPort,

    @Inject(GET_ALL_ALARMS_BY_REQUEST_PORT)
    private readonly getAllAlarmsByRequestPort: GetAllAlarmsByRequestPort,

    @Inject(CREATE_ALARM_PORT)
    private readonly createAlarmPort: CreateAlarmPort,

    @Inject(UPDATE_ALARM_PORT)
    private readonly updateAlarmPort: UpdateAlarmPort,

    @Inject(DELETE_ALARM_PORT)
    private readonly deleteAlarmPort: DeleteAlarmPort,

    @Inject(FIND_ALL_ACTIVE_ALARMS_PORT)
    private readonly findAllActiveAlarmsPort: FindAllActiveAlarmsPort,

    @Inject(FIND_ACTIVE_ALARM_BY_ID_PORT)
    private readonly findActiveAlarmByIdPort: FindActiveAlarmByIdPort,

    @Inject(FIND_ACTIVE_ALARM_BY_RULE_ID_PORT)
    private readonly findActiveAlarmByRuleIdPort: FindActiveAlarmByRuleIdPort,

    @Inject(SAVE_ACTIVE_ALARM_PORT)
    private readonly saveActiveAlarmPort: SaveActiveAlarmPort,

    @Inject(RESOLVE_ACTIVE_ALARM_PORT)
    private readonly resolveActiveAlarmPort: ResolveActiveAlarmPort,
  ) { }

  // ─── Alarm use cases ────────────────────────────────────────────────────────

  async getAllAlarms(): Promise<Alarm[]> {
    return this.getAllAlarmsPort.getAllAlarms();
  }

  async getAlarm(id: string): Promise<Alarm> {
    const alarm = await this.getAlarmByIdPort.getAlarmById(id);
    if (!alarm) throw new NotFoundException(`Alarm with id ${id} not found`);
    return alarm;
  }

  async createAlarm(cmd: CreateAlarmCmd): Promise<Alarm> {
    return this.createAlarmPort.createAlarm(cmd);
  }

  async updateAlarm(cmd: UpdateAlarmCmd): Promise<Alarm> {
    await this.getAlarm(cmd.id); // controlla se esiste
    return this.updateAlarmPort.updateAlarm(cmd.id, cmd);
  }

  async deleteAlarm(id: string): Promise<void> {
    await this.getAlarm(id); // come prima controlla
    return this.deleteAlarmPort.deleteAlarm(id);
  }

  // ─── ActiveAlarm use cases ──────────────────────────────────────────────────

  async getActiveAlarms(): Promise<ActiveAlarm[]> {
    return this.findAllActiveAlarmsPort.findAllActive();
  }

  async resolveActiveAlarm(id: string): Promise<void> {
    const alarm = await this.findActiveAlarmByIdPort.findById(id);
    if (!alarm) throw new NotFoundException(`ActiveAlarm with id ${id} not found`);
    return this.resolveActiveAlarmPort.resolve(id, new Date());
  }

  // Chiamato internamente quando un sensore supera la soglia.
  async triggerActiveAlarm(cmd: TriggerActiveAlarmCmd): Promise<void> {
    const existing = await this.findActiveAlarmByRuleIdPort.findActiveByRuleId(cmd.alarmId);
    if (existing) return; // se c'è un allarme che per questa regola è già attivo, allora non ne viene creato un altro

    const activeAlarm = new ActiveAlarm(
      randomUUID(),
      cmd.alarmId,
      cmd.alarmName,
      cmd.dangerSignal,
      new Date(),
      null, // non ancora risolto
    );
    await this.saveActiveAlarmPort.save(activeAlarm);
  }
}
