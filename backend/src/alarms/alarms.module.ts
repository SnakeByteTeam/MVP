import { Module } from '@nestjs/common';
import { AlarmRulesController } from './adapters/in/alarm-rules.controller';
import { AlarmEventsController } from './adapters/in/alarm-events.controller';
import { AlarmRuleService } from './application/services/alarm-rule.service';
import { RESOLVE_ALARM_EVENT_USE_CASE } from './application/ports/in/resolve-active-alarm.use-case';
import { CREATE_ALARM_RULE_USE_CASE } from './application/ports/in/create-alarm-rule.use-case';
import { DELETE_ALARM_RULE_USE_CASE } from './application/ports/in/delete-alarm-rule.use-case';
import { GET_ALARM_RULE_BY_ID_USE_CASE } from './application/ports/in/get-alarm-rule-by-id.use-case';
import { GET_ALL_ALARM_RULES_USE_CASE } from './application/ports/in/get-all-alarm-rules.use-case';
import { UPDATE_ALARM_RULE_USE_CASE } from './application/ports/in/update-alarm-rule.use-case';
import { AlarmEventsRepositoryImpl } from './infrastructure/persistence/alarm-events-repository-impl';
import { GET_ALL_ALARM_EVENTS_PORT } from './application/ports/out/get-all-alarm-events.port';
import { AlarmRulesRepositoryImpl } from './infrastructure/persistence/alarm-rules-repository-impl';
import { CREATE_ALARM_RULE_PORT } from './application/ports/out/create-alarm-rule.port';
import { AlarmEventsService } from './application/services/alarm-events.service';
import { GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE } from './application/ports/in/get-all-managed-alarm-events-by-user-id-use-case.interface';
import { GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_PORT } from './application/ports/out/get-all-managed-alarm-events-by-user-id-port.interface';
import { GET_ALL_ALARM_EVENTS_USE_CASE } from './application/ports/in/get-all-alarm-events-use-case.interface';
import { RESOLVE_ALARM_EVENT_PORT } from './application/ports/out/resolve-alarm-event-port.interface';
import { DELETE_ALARM_RULE_PORT } from './application/ports/out/delete-alarm-rule.port';
import { GET_ALL_ALARM_RULES_PORT } from './application/ports/out/get-all-alarm-rules.port';
import { GET_ALARM_RULE_BY_ID_PORT } from './application/ports/out/get-alarm-rule-by-id.port';
import { UPDATE_ALARM_RULE_PORT } from './application/ports/out/update-alarm-rule.port';
import { CHECK_ALARM_RULE_PORT } from './application/ports/out/check-alarm-rule-port.interface';
import { CREATE_ALARM_EVENT_PORT } from './application/ports/out/create-alarm-event-port.interface';
import { GuardModule } from '../guard/guard.module';
import { CHECK_ALARM_RULE_USECASE } from './application/ports/in/check-alarm-rule-use-case.interface';
import { GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE } from './application/ports/in/get-all-unmanaged-alarm-events-by-user-id-use-case.interface';
import { GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_PORT } from './application/ports/out/get-all-unmanaged-alarm-events-by-user-id-port.interface';
import { GET_WARD_ALARM_EVENT_PORT } from './application/ports/out/get-ward-alarm-event.port';
import { GET_ALARM_EVENT_BY_ID_PORT } from './application/ports/out/get-alarm-event-by-id-port.interface';
import { GET_ALARM_EVENT_BY_ID_USE_CASE } from './application/ports/in/get-alarm-event-by-id-use-case.interface';
import { ALARM_EVENTS_REPOSITORY } from './application/repository/alarm-events-repository.interface';
import { ALARM_RULES_REPOSITORY } from './application/repository/alarm-rules-repository.interface';
import { AlarmEventsPersistenceAdapter } from './adapters/out/alarm-events-persistence-adapter';
import { AlarmRulesPersistenceAdapter } from './adapters/out/alarm-rules-persistence-adapter';

@Module({
  imports: [GuardModule],
  controllers: [AlarmRulesController, AlarmEventsController],
  providers: [
    { provide: CREATE_ALARM_RULE_USE_CASE, useClass: AlarmRuleService },
    { provide: CREATE_ALARM_RULE_PORT, useClass: AlarmRulesPersistenceAdapter },
    { provide: DELETE_ALARM_RULE_USE_CASE, useClass: AlarmRuleService },
    { provide: DELETE_ALARM_RULE_PORT, useClass: AlarmRulesPersistenceAdapter },
    { provide: GET_ALL_ALARM_RULES_USE_CASE, useClass: AlarmRuleService },
    {
      provide: GET_ALL_ALARM_RULES_PORT,
      useClass: AlarmRulesPersistenceAdapter,
    },
    { provide: GET_ALARM_RULE_BY_ID_USE_CASE, useClass: AlarmRuleService },
    {
      provide: GET_ALARM_RULE_BY_ID_PORT,
      useClass: AlarmRulesPersistenceAdapter,
    },
    { provide: UPDATE_ALARM_RULE_USE_CASE, useClass: AlarmRuleService },
    {
      provide: UPDATE_ALARM_RULE_PORT,
      useClass: AlarmRulesPersistenceAdapter,
    },
    {
      provide: GET_ALL_ALARM_EVENTS_USE_CASE,
      useClass: AlarmEventsService,
    },
    {
      provide: GET_ALL_ALARM_EVENTS_PORT,
      useClass: AlarmEventsPersistenceAdapter,
    },
    {
      provide: GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE,
      useClass: AlarmEventsService,
    },
    {
      provide: GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE,
      useClass: AlarmEventsService,
    },
    {
      provide: GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
      useClass: AlarmEventsPersistenceAdapter,
    },
    {
      provide: GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
      useClass: AlarmEventsPersistenceAdapter,
    },
    {
      provide: GET_ALARM_EVENT_BY_ID_PORT,
      useClass: AlarmEventsPersistenceAdapter,
    },
    {
      provide: GET_ALARM_EVENT_BY_ID_USE_CASE,
      useClass: AlarmEventsService,
    },
    {
      provide: RESOLVE_ALARM_EVENT_USE_CASE,
      useClass: AlarmEventsService,
    },
    {
      provide: RESOLVE_ALARM_EVENT_PORT,
      useClass: AlarmEventsPersistenceAdapter,
    },
    {
      provide: CHECK_ALARM_RULE_PORT,
      useClass: AlarmRulesPersistenceAdapter,
    },
    {
      provide: CREATE_ALARM_EVENT_PORT,
      useClass: AlarmEventsPersistenceAdapter,
    },
    {
      provide: ALARM_EVENTS_REPOSITORY,
      useClass: AlarmEventsRepositoryImpl,
    },
    {
      provide: ALARM_RULES_REPOSITORY,
      useClass: AlarmRulesRepositoryImpl,
    },
    {
      provide: CHECK_ALARM_RULE_USECASE,
      useClass: AlarmRuleService,
    },
    {provide: GET_WARD_ALARM_EVENT_PORT, useClass: AlarmEventsPersistenceAdapter}, 
  ],
  exports: [CHECK_ALARM_RULE_USECASE],
})
export class AlarmsModule {}
