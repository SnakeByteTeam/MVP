import { WardEntity } from '../../infrastructure/entities/ward-entity';

export interface UpdateWardRepository {
  updateWard(id: number, name: string): Promise<WardEntity>;
}

export const UPDATE_WARD_REPOSITORY = 'UPDATE_WARD_REPOSITORY';
