// import { v4 as uuidv4 } from 'uuid';
// import { Inject, Injectable, NotFoundException } from '@nestjs/common';
// import { TriggerActiveAlarmCmd } from '../commands/trigger-active-alarm.cmd';
// import { ResolveActiveAlarmCmd } from '../commands/resolve-active-alarm-cmd';
// import { ActiveAlarm } from '../../domain/models/alarm-event.model';
// import { GetActiveAlarmsUseCase } from '../ports/in/get-active-alarms.use-case';
// import { ResolveActiveAlarmUseCase } from '../ports/in/resolve-active-alarm.use-case';
// import {
//   RESOLVE_ACTIVE_ALARM_PORT,
//   ResolveActiveAlarmPort,
// } from '../ports/out/resolve-active-alarm-port.interface';
// import {
//   GET_ALL_ACTIVE_ALARMS_PORT,
//   GetAllActiveAlarmsPort,
// } from '../ports/out/get-all-active-alarms.port';

// @Injectable()
// export class ActiveAlarmsService
//   implements GetActiveAlarmsUseCase, ResolveActiveAlarmUseCase
// {
//   constructor(
//     // @Inject(FIND_ALL_ACTIVE_ALARMS_PORT)
//     // private readonly findAllActiveAlarmsPort: FindAllActiveAlarmsPort,

//     // @Inject(FIND_ACTIVE_ALARM_BY_ID_PORT)
//     // private readonly findActiveAlarmByIdPort: FindActiveAlarmByIdPort,

//     // @Inject(FIND_ACTIVE_ALARM_BY_RULE_ID_PORT)
//     // private readonly findActiveAlarmByRuleIdPort: FindActiveAlarmByRuleIdPort,

//     // @Inject(SAVE_ACTIVE_ALARM_PORT)
//     // private readonly saveActiveAlarmPort: SaveActiveAlarmPort,

//     @Inject(GET_ALL_ACTIVE_ALARMS_PORT)
//     private readonly findAllActiveAlarmsPort: GetAllActiveAlarmsPort,

//     @Inject(RESOLVE_ACTIVE_ALARM_PORT)
//     private readonly resolveActiveAlarmPort: ResolveActiveAlarmPort,
//   ) {}

//   async getActiveAlarms(): Promise<ActiveAlarm[]> {
//     return this.findAllActiveAlarmsPort.findAllActive();
//   }

//   async resolveActiveAlarm(req: ResolveActiveAlarmCmd): Promise<void> {
//     return this.resolveActiveAlarmPort.resolveActiveAlarm(req);
//   }

//   // // Chiamato internamente quando un sensore supera la soglia.
//   // async triggerActiveAlarm(cmd: TriggerActiveAlarmCmd): Promise<void> {
//   //   const existing = await this.findActiveAlarmByRuleIdPort.findActiveByRuleId(
//   //     cmd.alarmId,
//   //   );
//   //   if (existing) return; // se c'è un allarme che per questa regola è già attivo, allora non ne viene creato un altro

//   //   const activeAlarm = new ActiveAlarm(
//   //     uuidv4(),
//   //     cmd.alarmId,
//   //     cmd.alarmName,
//   //     cmd.dangerSignal,
//   //     new Date(),
//   //     null, // non ancora risolto
//   //   );
//   //   await this.saveActiveAlarmPort.save(activeAlarm);
//   // }
// }
