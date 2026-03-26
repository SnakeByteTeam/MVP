import { WardEntity } from '../../infrastructure/entities/ward-entity';

export interface FindAllWardsRepository {
  findAllWards(): Promise<WardEntity[]>;
}

export const FIND_ALL_WARDS_REPOSITORY = 'FIND_ALL_WARDS_REPOSITORY';
