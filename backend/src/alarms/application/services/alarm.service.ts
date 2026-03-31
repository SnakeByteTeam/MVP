import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Alarm } from '../../domain/models/alarm.model';

import {
  GET_ALL_ALARMS_PORT,
  GetAllAlarmsPort,
} from '../ports/out/get-all-alarms.port';
import {
  GET_ALARM_BY_ID_PORT,
  GetAlarmByIdPort,
} from '../ports/out/get-alarm-by-id.port';
import {
  GET_ALL_ALARMS_BY_REQUEST_PORT,
  GetAllAlarmsByRequestPort,
} from '../ports/out/get-all-alarms-by-request.port';
import {
  CREATE_ALARM_PORT,
  CreateAlarmPort,
} from '../ports/out/create-alarm.port';
import {
  UPDATE_ALARM_PORT,
  UpdateAlarmPort,
} from '../ports/out/update-alarm.port';
import {
  DELETE_ALARM_PORT,
  DeleteAlarmPort,
} from '../ports/out/delete-alarm.port';

import { CreateAlarmUseCase } from '../ports/in/create-alarm.use-case';
import { GetAllAlarmsUseCase } from '../ports/in/get-all-alarms.use-case';
import { GetAlarmUseCase } from '../ports/in/get-alarm.use-case';
import { UpdateAlarmUseCase } from '../ports/in/update-alarm.use-case';
import { DeleteAlarmUseCase } from '../ports/in/delete-alarm.use-case';

import { CreateAlarmCmd } from '../commands/create-alarm.cmd';
import { UpdateAlarmCmd } from '../commands/update-alarm.cmd';
import { DeleteAlarmCmd } from '../commands/delete-alarm-cmd';
import { GetAlarmCmd } from '../commands/get-alarm-cmd';

@Injectable()
export class AlarmService
  implements
    CreateAlarmUseCase,
    GetAllAlarmsUseCase,
    GetAlarmUseCase,
    UpdateAlarmUseCase,
    DeleteAlarmUseCase
{
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
  ) {}

  async getAllAlarms(): Promise<Alarm[]> {
    return this.getAllAlarmsPort.getAllAlarms();
  }

  async getAlarm(req: GetAlarmCmd): Promise<Alarm> {
    const alarm = await this.getAlarmByIdPort.getAlarmById(req.id);
    if (!alarm)
      throw new NotFoundException(`Alarm with id ${req.id} not found`);
    return alarm;
  }

  async createAlarm(cmd: CreateAlarmCmd): Promise<Alarm> {
    return this.createAlarmPort.createAlarm(cmd);
  }

  async updateAlarm(cmd: UpdateAlarmCmd): Promise<Alarm> {
    return this.updateAlarmPort.updateAlarm(cmd.id, cmd);
  }

  async deleteAlarm(req: DeleteAlarmCmd): Promise<void> {
    return this.deleteAlarmPort.deleteAlarm(req.id);
  }
}
