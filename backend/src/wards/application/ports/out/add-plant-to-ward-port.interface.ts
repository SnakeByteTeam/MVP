import { AddPlantToWardCmd } from '../../commands/add-plant-to-ward-cmd';

export interface AddPlantToWardPort {
  addPlantToWard(req: AddPlantToWardCmd);
}
