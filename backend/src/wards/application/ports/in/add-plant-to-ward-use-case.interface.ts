import { AddPlantToWardCmd } from '../../commands/add-plant-to-ward-cmd';
import { Plant } from 'src/plant/domain/models/plant.model';

export interface AddPlantToWardUseCase {
  addPlantToWard(req: AddPlantToWardCmd): Promise<Plant>;
}
