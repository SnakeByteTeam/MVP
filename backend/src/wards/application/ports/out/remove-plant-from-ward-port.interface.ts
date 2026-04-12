import { RemovePlantFromWardCmd } from '../../commands/remove-plant-from-ward-cmd';

export interface RemovePlantFromWardPort {
  removePlantFromWard(req: RemovePlantFromWardCmd): Promise<void>;
}

export const REMOVE_PLANT_FROM_WARD_PORT = 'REMOVE_PLANT_FROM_WARD_PORT';
