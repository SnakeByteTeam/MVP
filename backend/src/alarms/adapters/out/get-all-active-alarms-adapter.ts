import { Inject } from '@nestjs/common';
import { GetAllActiveAlarmsPort } from '../../application/ports/out/get-all-active-alarms.port';
import { ActiveAlarm } from '../../domain/models/alarm-event.model';
import {
  GET_ALL_ACTIVE_ALARMS_REPOSITORY,
  GetAllActiveAlarmsRepository,
} from '../../application/repository/get-all-active-alarms-repository.interface';

export class GetAllActiveAlarmsAdapter implements GetAllActiveAlarmsPort {
  constructor(
    @Inject(GET_ALL_ACTIVE_ALARMS_REPOSITORY)
    private readonly getAllActiveAlarmsRepository: GetAllActiveAlarmsRepository,
  ) {}

  async getAllActiveAlarms(): Promise<ActiveAlarm[]> {
    const activeAlarms =
      await this.getAllActiveAlarmsRepository.getAllActiveAlarms();
    return activeAlarms.map((alarm) => new ActiveAlarm(alarm.id));
  }
}
