import { Inject } from '@nestjs/common';
import { CreateAlarmEventCmd } from '../../application/commands/create-alarm-event-cmd';
import { CreateAlarmEventPort } from '../../application/ports/out/create-alarm-event-port.interface';
import {
  CREATE_ALARM_EVENT_REPOSITORY,
  CreateAlarmEventRepository,
} from '../../application/repository/create-alarm-event-repository.interface';

export class CreateAlarmEventAdapter implements CreateAlarmEventPort {
  constructor(
    @Inject(CREATE_ALARM_EVENT_REPOSITORY)
    private readonly createAlarmEventRepository: CreateAlarmEventRepository,
  ) {}

  async createAlarmEvent(req: CreateAlarmEventCmd): Promise<void> {
    return await this.createAlarmEventRepository.createAlarmEvent(
      req.alarmRuleId,
      req.activationTime,
    );
  }
}
