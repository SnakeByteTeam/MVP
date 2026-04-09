import { Plant } from 'src/plant/domain/models/plant.model';
import { AddPlantToWardCmd } from '../../commands/add-plant-to-ward-cmd';

export interface AddPlantToWardPort {
  addPlantToWard(req: AddPlantToWardCmd): Promise<Plant>;
}
