import { Module } from '@nestjs/common';
import { AlarmsController } from './adapters/in/alarms.controller';
import { ActiveAlarmsController } from './adapters/in/active-alarms.controller';
import { AlarmService } from './application/services/alarm.service';
import { GetAllAlarmsRepository } from './application/repository/get-all-alarms.repository';
import { GetAlarmByIdRepository } from './application/repository/get-alarm-by-id.repository';
import { GetAllAlarmsByRequestRepository } from './application/repository/get-all-alarms-by-request.repository';
import { CreateAlarmRepository } from './application/repository/create-alarm.repository';
import { UpdateAlarmRepository } from './application/repository/update-alarm.repository';
import { DeleteAlarmRepository } from './application/repository/delete-alarm.repository';
import { FindAllActiveAlarmsRepository } from './application/repository/find-all-active-alarms.repository';
import { FindActiveAlarmByIdRepository } from './application/repository/find-active-alarm-by-id.repository';
import { FindActiveAlarmByRuleIdRepository } from './application/repository/find-active-alarm-by-rule-id.repository';
import { SaveActiveAlarmRepository } from './application/repository/save-active-alarm.repository';
import { ResolveActiveAlarmRepository } from './application/repository/resolve-active-alarm.repository';
import { GET_ALL_ALARMS_PORT } from './application/ports/out/get-all-alarms.port';
import { GET_ALARM_BY_ID_PORT } from './application/ports/out/get-alarm-by-id.port';
import { GET_ALL_ALARMS_BY_REQUEST_PORT } from './application/ports/out/get-all-alarms-by-request.port';
import { CREATE_ALARM_PORT } from './application/ports/out/create-alarm.port';
import { UPDATE_ALARM_PORT } from './application/ports/out/update-alarm.port';
import { DELETE_ALARM_PORT } from './application/ports/out/delete-alarm.port';
import {
  FIND_ALL_ACTIVE_ALARMS_PORT,
  FIND_ACTIVE_ALARM_BY_ID_PORT,
  FIND_ACTIVE_ALARM_BY_RULE_ID_PORT,
  SAVE_ACTIVE_ALARM_PORT,
  RESOLVE_ACTIVE_ALARM_PORT,
} from './application/ports/out/find-active-alarms.port';
import { RESOLVE_ACTIVE_ALARM_USE_CASE } from './application/ports/in/resolve-active-alarm.use-case';
import { CREATE_ALARM_USE_CASE } from './application/ports/in/create-alarm.use-case';
import { DELETE_ALARM_USE_CASE } from './application/ports/in/delete-alarm.use-case';
import { GET_ACTIVE_ALARMS_USE_CASE } from './application/ports/in/get-active-alarms.use-case';
import { GET_ALARM_USE_CASE } from './application/ports/in/get-alarm.use-case';
import { GET_ALL_ALARMS_USE_CASE } from './application/ports/in/get-all-alarms.use-case';
import { TRIGGER_ACTIVE_ALARM_USE_CASE } from './application/ports/in/trigger-active-alarm.use-case';
import { UPDATE_ALARM_USE_CASE } from './application/ports/in/update-alarm.use-case';

@Module({
  controllers: [AlarmsController, ActiveAlarmsController],
  providers: [
    { provide: CREATE_ALARM_USE_CASE, useClass: AlarmService },
    { provide: DELETE_ALARM_USE_CASE, useClass: AlarmService },
    { provide: GET_ALARM_USE_CASE, useClass: AlarmService },
    { provide: GET_ALL_ALARMS_USE_CASE, useClass: AlarmService },
    { provide: UPDATE_ALARM_USE_CASE, useClass: AlarmService },

    { provide: GET_ACTIVE_ALARMS_USE_CASE, useClass: AlarmService },
    { provide: RESOLVE_ACTIVE_ALARM_USE_CASE, useClass: AlarmService },
    { provide: TRIGGER_ACTIVE_ALARM_USE_CASE, useClass: AlarmService },

    { provide: GET_ALL_ALARMS_PORT, useClass: GetAllAlarmsRepository },
    { provide: GET_ALARM_BY_ID_PORT, useClass: GetAlarmByIdRepository },
    {
      provide: GET_ALL_ALARMS_BY_REQUEST_PORT,
      useClass: GetAllAlarmsByRequestRepository,
    },
    { provide: CREATE_ALARM_PORT, useClass: CreateAlarmRepository },
    { provide: UPDATE_ALARM_PORT, useClass: UpdateAlarmRepository },
    { provide: DELETE_ALARM_PORT, useClass: DeleteAlarmRepository },
    {
      provide: FIND_ALL_ACTIVE_ALARMS_PORT,
      useClass: FindAllActiveAlarmsRepository,
    },
    {
      provide: FIND_ACTIVE_ALARM_BY_ID_PORT,
      useClass: FindActiveAlarmByIdRepository,
    },
    {
      provide: FIND_ACTIVE_ALARM_BY_RULE_ID_PORT,
      useClass: FindActiveAlarmByRuleIdRepository,
    },
    { provide: SAVE_ACTIVE_ALARM_PORT, useClass: SaveActiveAlarmRepository },
    {
      provide: RESOLVE_ACTIVE_ALARM_PORT,
      useClass: ResolveActiveAlarmRepository,
    },
  ],
})
export class AlarmsModule {}
