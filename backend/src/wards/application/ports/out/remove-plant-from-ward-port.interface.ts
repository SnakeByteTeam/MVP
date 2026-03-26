import { RemovePlantFromWardCmd } from '../../commands/remove-plant-from-ward-cmd';

export interface RemovePlantFromWardPort {
  removePlantFromWard(req: RemovePlantFromWardCmd);
}
