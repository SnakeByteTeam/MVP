export interface RemovePlantFromWardRepository {
  removePlantToWard(wardId: number, plantId: number);
}

export const REMOVE_PLANT_FROM_WARD_REPOSITORY =
  'REMOVE_PLANT_FROM_WARD_REPOSITORY';
