import { RemovePlantFromWardCmd } from '../../commands/remove-plant-from-ward-cmd';

export interface RemovePlantFromWardUseCase {
  removePlantFromWard(req: RemovePlantFromWardCmd): Promise<void>;
}
