import { FindAllPlantsByWardIdCmd } from '../../commands/find-all-plants-by-ward-id-cmd';

export interface FindAllPlantsByWardIdUseCase {
  findAllPlantsByWardId(req: FindAllPlantsByWardIdCmd);
}
