import { Inject } from '@nestjs/common';
import { DeleteAlarmRuleCmd } from '../../application/commands/delete-alarm-rule-cmd';
import { DeleteAlarmRulePort } from '../../application/ports/out/delete-alarm-rule.port';
import { DELETE_ALARM_RULE_REPOSITORY, DeleteAlarmRuleRepository } from '../../application/repository/delete-alarm-rule-repository.interface';

export class DeleteAlarmRuleAdapter implements DeleteAlarmRulePort {
  constructor(
    @Inject(DELETE_ALARM_RULE_REPOSITORY)
    private readonly deleteAlarmRuleRepository: DeleteAlarmRuleRepository,
  ) {}

  async deleteAlarmRule(req: DeleteAlarmRuleCmd): Promise<void> {
    return await this.deleteAlarmRuleRepository.deleteAlarmRule(req.id);
  }
}

export const DELETE_ALARM_RULE_PORT = 'DELETE_ALARM_RULE_PORT';
