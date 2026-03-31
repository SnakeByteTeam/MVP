import { Module } from '@nestjs/common';
import { AlarmRulesController } from './adapters/in/alarm-rules.controller';
import { EventAlarmsController } from './adapters/in/event-alarms.controller';
import { AlarmRuleService } from './application/services/alarm-rule.service';
import { RESOLVE_ACTIVE_ALARM_USE_CASE } from './application/ports/in/resolve-active-alarm.use-case';
import { CREATE_ALARM_RULE_USE_CASE } from './application/ports/in/create-alarm-rule.use-case';
import { DELETE_ALARM_RULE_USE_CASE } from './application/ports/in/delete-alarm-rule.use-case';
import { GET_ACTIVE_ALARMS_USE_CASE } from './application/ports/in/get-active-alarms.use-case';
import { GET_ALARM_RULE_USE_CASE } from './application/ports/in/get-alarm-rule.use-case';
import { GET_ALL_ALARM_RULES_USE_CASE } from './application/ports/in/get-all-alarm-rules.use-case';
import { TRIGGER_ACTIVE_ALARM_USE_CASE } from './application/ports/in/trigger-active-alarm.use-case';
import { UPDATE_ALARM_RULE_USE_CASE } from './application/ports/in/update-alarm-rule.use-case';
import { CREATE_ALARM_RULE_REPOSITORY } from './application/repository/create-alarm-rule-repository.interface';
import { ResolveActiveAlarmAdapter } from './adapters/out/resolve-active-alarm-adapter';
import { RESOLVE_ACTIVE_ALARM_PORT } from './application/ports/out/resolve-active-alarm-port.interface';
import { ActiveAlarmsRepositoryImpl } from './infrastructure/persistence/active-alarms-repository-impl';
import { RESOLVE_ACTIVE_ALARM_REPOSITORY } from './application/repository/resolve-active-alarm-repository.interface';
import { GET_ALL_ACTIVE_ALARMS_PORT } from './application/ports/out/get-all-active-alarms.port';
import { GetAllActiveAlarmsAdapter } from './adapters/out/get-all-active-alarms-adapter';
import { GET_ALL_ACTIVE_ALARMS_REPOSITORY } from './application/repository/get-all-active-alarms-repository.interface';
import { GET_ALARM_RULE_REPOSITORY } from './application/repository/get-alarm-repository.interface';
import { AlarmRulesRepositoryImpl } from './infrastructure/persistence/alarm-rules-repository-impl';
import { UPDATE_ALARM_RULE_REPOSITORY } from './application/repository/update-alarm-rule-repository.interface';
import { DELETE_ALARM_RULE_REPOSITORY } from './application/repository/delete-alarm-rule-repository.interface';
import { DELETE_ALARM_RULE_PORT, DeleteAlarmRuleAdapter } from './adapters/out/delete-alarm-rule-adapter';
import { CREATE_ALARM_RULE_PORT } from './application/ports/out/create-alarm-rule.port';
import { CreateAlarmRuleAdapter } from './adapters/out/create-alarm-rule-adapter';

@Module({
  controllers: [AlarmRulesController, EventAlarmsController],
  providers: [
    { provide: CREATE_ALARM_RULE_USE_CASE, useClass: AlarmRuleService },
    { provide: DELETE_ALARM_RULE_USE_CASE, useClass: AlarmRuleService },
    { provide: GET_ALARM_RULE_USE_CASE, useClass: AlarmRuleService },
    { provide: GET_ALL_ALARM_RULES_USE_CASE, useClass: AlarmRuleService },
    { provide: UPDATE_ALARM_RULE_USE_CASE, useClass: AlarmRuleService },

    // { provide: GET_ACTIVE_ALARMS_USE_CASE, useClass: AlarmService },
    // { provide: RESOLVE_ACTIVE_ALARM_USE_CASE, useClass: AlarmService },
    // { provide: TRIGGER_ACTIVE_ALARM_USE_CASE, useClass: AlarmService },

    { provide: CREATE_ALARM_RULE_PORT, useClass: CreateAlarmRuleAdapter },
    { provide: CREATE_ALARM_RULE_REPOSITORY, useClass: AlarmRulesRepositoryImpl },

    { provide: DELETE_ALARM_RULE_PORT, useClass: DeleteAlarmRuleAdapter },
    {
      provide: DELETE_ALARM_RULE_REPOSITORY,
      useClass: AlarmRulesRepositoryImpl,
    },

    { provide: RESOLVE_ACTIVE_ALARM_PORT, useClass: ResolveActiveAlarmAdapter },
    {
      provide: RESOLVE_ACTIVE_ALARM_REPOSITORY,
      useClass: ActiveAlarmsRepositoryImpl,
    },

    {
      provide: UPDATE_ALARM_RULE_REPOSITORY,
      useClass: AlarmRulesRepositoryImpl,
    },

    { provide: GET_ALARM_RULE_REPOSITORY, useClass: AlarmRulesRepositoryImpl },

    {
      provide: GET_ALL_ACTIVE_ALARMS_PORT,
      useClass: GetAllActiveAlarmsAdapter,
    },
    {
      provide: GET_ALL_ACTIVE_ALARMS_REPOSITORY,
      useClass: ActiveAlarmsRepositoryImpl,
    },
  ],
})
export class AlarmsModule {}
