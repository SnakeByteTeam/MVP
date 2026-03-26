import { PlantEntity } from '../../infrastructure/entities/plant-entity';

export interface FindAllPlantsByWardIdRepository {
  findAllPlantsByWardId(wardId: number): Promise<PlantEntity[]>;
}

export const FIND_ALL_PLANTS_BY_WARD_ID_REPOSITORY =
  'FIND_ALL_PLANTS_BY_WARD_ID_REPOSITORY';
