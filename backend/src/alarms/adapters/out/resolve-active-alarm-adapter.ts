import { Inject } from '@nestjs/common';
import { ResolveActiveAlarmCmd } from '../../application/commands/resolve-active-alarm-cmd';
import { ResolveActiveAlarmPort } from '../../application/ports/out/resolve-active-alarm-port.interface';
import {
  RESOLVE_ACTIVE_ALARM_REPOSITORY,
  ResolveActiveAlarmRepository,
} from '../../application/repository/resolve-active-alarm-repository.interface';

export class ResolveActiveAlarmAdapter implements ResolveActiveAlarmPort {
  constructor(
    @Inject(RESOLVE_ACTIVE_ALARM_REPOSITORY)
    private readonly resolveActiveAlarmRepository: ResolveActiveAlarmRepository,
  ) {}

  async resolveActiveAlarm(req: ResolveActiveAlarmCmd): Promise<void> {
    await this.resolveActiveAlarmRepository.resolveActiveAlarm(req.id);
  }
}
