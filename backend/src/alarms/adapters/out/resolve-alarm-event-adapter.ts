import { Inject } from '@nestjs/common';
import { ResolveAlarmEventCmd } from '../../application/commands/resolve-alarm-event-cmd';
import { ResolveAlarmEventPort } from '../../application/ports/out/resolve-alarm-event-port.interface';
import {
  RESOLVE_ALARM_EVENT_REPOSITORY,
  ResolveAlarmEventRepository,
} from '../../application/repository/resolve-alarm-event-repository.interface';

export class ResolveAlarmEventAdapter implements ResolveAlarmEventPort {
  constructor(
    @Inject(RESOLVE_ALARM_EVENT_REPOSITORY)
    private readonly resolveAlarmEventRepository: ResolveAlarmEventRepository,
  ) {}
  async resolveAlarmEvent(req: ResolveAlarmEventCmd): Promise<void> {
    return await this.resolveAlarmEventRepository.resolveAlarmEvent(req.id);
  }
}
