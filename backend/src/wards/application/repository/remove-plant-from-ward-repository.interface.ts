export interface RemovePlantFromWardRepository {
  removePlantFromWard(plantId: string): Promise<void>;
}

export const REMOVE_PLANT_FROM_WARD_REPOSITORY =
  'REMOVE_PLANT_FROM_WARD_REPOSITORY';
