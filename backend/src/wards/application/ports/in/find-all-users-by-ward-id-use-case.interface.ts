import { FindAllUsersByWardIdCmd } from '../../commands/find-all-users-by-ward-id-cmd';

export interface FindAllUsersByWardIdUseCase {
  findAllUsersByWardId(req: FindAllUsersByWardIdCmd);
}
