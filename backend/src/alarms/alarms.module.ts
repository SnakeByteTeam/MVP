import { Module } from '@nestjs/common';
import { AlarmRulesController } from './adapters/in/alarm-rules.controller';
import { AlarmEventsController } from './adapters/in/alarm-events.controller';
import { AlarmRuleService } from './application/services/alarm-rule.service';
import { RESOLVE_ALARM_EVENT_USE_CASE } from './application/ports/in/resolve-active-alarm.use-case';
import { CREATE_ALARM_RULE_USE_CASE } from './application/ports/in/create-alarm-rule.use-case';
import { DELETE_ALARM_RULE_USE_CASE } from './application/ports/in/delete-alarm-rule.use-case';
import { GET_ALARM_RULE_BY_ID_USE_CASE } from './application/ports/in/get-alarm-rule.use-case';
import { GET_ALL_ALARM_RULES_USE_CASE } from './application/ports/in/get-all-alarm-rules.use-case';
import { UPDATE_ALARM_RULE_USE_CASE } from './application/ports/in/update-alarm-rule.use-case';
import { CREATE_ALARM_RULE_REPOSITORY } from './application/repository/create-alarm-rule-repository.interface';
import { ResolveAlarmEventAdapter } from './adapters/out/resolve-alarm-event-adapter';
import { AlarmEventsRepositoryImpl } from './infrastructure/persistence/alarm-events-repository-impl';
import { RESOLVE_ALARM_EVENT_REPOSITORY } from './application/repository/resolve-alarm-event-repository.interface';
import { GET_ALL_ALARM_EVENTS_PORT } from './application/ports/out/get-all-alarm-events.port';
import { GetAllAlarmEventsAdapter } from './adapters/out/get-all-alarm-events-adapter';
import { GET_ALL_ALARM_EVENTS_REPOSITORY } from './application/repository/get-all-alarm-events-repository.interface';
import { AlarmRulesRepositoryImpl } from './infrastructure/persistence/alarm-rules-repository-impl';
import { UPDATE_ALARM_RULE_REPOSITORY } from './application/repository/update-alarm-rule-repository.interface';
import { DELETE_ALARM_RULE_REPOSITORY } from './application/repository/delete-alarm-rule-repository.interface';
import { DeleteAlarmRuleAdapter } from './adapters/out/delete-alarm-rule-adapter';
import { CREATE_ALARM_RULE_PORT } from './application/ports/out/create-alarm-rule.port';
import { CreateAlarmRuleAdapter } from './adapters/out/create-alarm-rule-adapter';
import { AlarmEventsService } from './application/services/alarm-events.service';
import { GET_ALL_ALARM_EVENTS_BY_USER_ID_USE_CASE } from './application/ports/in/get-all-alarms-events-by-user-id-use-case.interface';
import { GET_ALL_ALARM_EVENTS_BY_USER_ID_REPOSITORY } from './application/repository/get-all-alarm-events-by-user-id-repository.interface';
import { GET_ALL_ALARM_EVENTS_BY_USER_ID_PORT } from './application/ports/out/get-all-alarms-events-by-user-id-port.interface';
import { GetAllAlarmEventsByUserIdAdapter } from './adapters/out/get-all-alarm-events-by-user-id-adapter';
import { GET_ALL_ALARM_EVENTS_USE_CASE } from './application/ports/in/get-all-alarm-events-use-case.interface';
import { RESOLVE_ALARM_EVENT_PORT } from './application/ports/out/resolve-alarm-event-port.interface';
import { DELETE_ALARM_RULE_PORT } from './application/ports/out/delete-alarm-rule.port';
import { GetAllAlarmRulesAdapter } from './adapters/out/get-all-alarm-rules-adapter';
import { GET_ALL_ALARM_RULES_PORT } from './application/ports/out/get-all-alarm-rules.port';
import { GetAlarmRuleByIdAdapter } from './adapters/out/get-alarm-rule-by-id-adapter';
import { GET_ALARM_RULE_BY_ID_PORT } from './application/ports/out/get-alarm-rule-by-id.port';
import { GET_ALL_ALARM_RULES_REPOSITORY } from './application/repository/get-all-alarm-rules-repository.interface';
import { GET_ALARM_RULE_BY_ID_REPOSITORY } from './application/repository/get-alarm-rule-by-id-repository.interface';
import { UpdateAlarmRuleAdapter } from './adapters/out/update-alarm-rule-adapter';
import { UPDATE_ALARM_RULE_PORT } from './application/ports/out/update-alarm-rule.port';

@Module({
  controllers: [AlarmRulesController, AlarmEventsController],
  providers: [
    { provide: CREATE_ALARM_RULE_USE_CASE, useClass: AlarmRuleService },
    { provide: CREATE_ALARM_RULE_PORT, useClass: CreateAlarmRuleAdapter },
    {
      provide: CREATE_ALARM_RULE_REPOSITORY,
      useClass: AlarmRulesRepositoryImpl,
    },

    { provide: DELETE_ALARM_RULE_USE_CASE, useClass: AlarmRuleService },
    { provide: DELETE_ALARM_RULE_PORT, useClass: DeleteAlarmRuleAdapter },
    {
      provide: DELETE_ALARM_RULE_REPOSITORY,
      useClass: AlarmRulesRepositoryImpl,
    },

    { provide: GET_ALL_ALARM_RULES_USE_CASE, useClass: AlarmRuleService },
    {
      provide: GET_ALL_ALARM_RULES_PORT,
      useClass: GetAllAlarmRulesAdapter,
    },
    {
      provide: GET_ALL_ALARM_RULES_REPOSITORY,
      useClass: AlarmRulesRepositoryImpl,
    },

    { provide: GET_ALARM_RULE_BY_ID_USE_CASE, useClass: AlarmRuleService },
    {
      provide: GET_ALARM_RULE_BY_ID_PORT,
      useClass: GetAlarmRuleByIdAdapter,
    },
    {
      provide: GET_ALARM_RULE_BY_ID_REPOSITORY,
      useClass: AlarmRulesRepositoryImpl,
    },

    { provide: UPDATE_ALARM_RULE_USE_CASE, useClass: AlarmRuleService },
    {
      provide: UPDATE_ALARM_RULE_PORT,
      useClass: UpdateAlarmRuleAdapter,
    },
    {
      provide: UPDATE_ALARM_RULE_REPOSITORY,
      useClass: AlarmRulesRepositoryImpl,
    },

    {
      provide: GET_ALL_ALARM_EVENTS_USE_CASE,
      useClass: AlarmEventsService,
    },
    {
      provide: GET_ALL_ALARM_EVENTS_REPOSITORY,
      useClass: AlarmEventsRepositoryImpl,
    },
    {
      provide: GET_ALL_ALARM_EVENTS_PORT,
      useClass: GetAllAlarmEventsAdapter,
    },

    {
      provide: GET_ALL_ALARM_EVENTS_BY_USER_ID_USE_CASE,
      useClass: AlarmEventsService,
    },
    {
      provide: GET_ALL_ALARM_EVENTS_BY_USER_ID_PORT,
      useClass: GetAllAlarmEventsByUserIdAdapter,
    },
    {
      provide: GET_ALL_ALARM_EVENTS_BY_USER_ID_REPOSITORY,
      useClass: AlarmEventsRepositoryImpl,
    },

    {
      provide: RESOLVE_ALARM_EVENT_USE_CASE,
      useClass: AlarmEventsService,
    },
    {
      provide: RESOLVE_ALARM_EVENT_PORT,
      useClass: ResolveAlarmEventAdapter,
    },
    {
      provide: RESOLVE_ALARM_EVENT_REPOSITORY,
      useClass: AlarmEventsRepositoryImpl,
    },
  ],
})
export class AlarmsModule {}
