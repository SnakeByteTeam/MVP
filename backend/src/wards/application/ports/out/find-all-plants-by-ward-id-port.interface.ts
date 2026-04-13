import { Plant } from 'src/plant/domain/models/plant.model';
import { FindAllPlantsByWardIdCmd } from '../../commands/find-all-plants-by-ward-id-cmd';

export interface FindAllPlantsByWardIdPort {
  findAllPlantsByWardId(req: FindAllPlantsByWardIdCmd): Promise<Plant[]>;
}

export const FIND_ALL_PLANTS_BY_WARD_ID_PORT = 'FIND_ALL_PLANTS_BY_WARD_ID_PORT';
