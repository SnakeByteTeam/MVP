export interface RemovePlantFromWardRepository {
  removePlantFromWard(wardId: number, plantId: number): Promise<void>;
}

export const REMOVE_PLANT_FROM_WARD_REPOSITORY =
  'REMOVE_PLANT_FROM_WARD_REPOSITORY';
