import { AddPlantToWardCmd } from "../../commands/add-plant-to-ward-cmd";

export interface AddPlantToWardUseCase {
    addPlantToWard(req: AddPlantToWardCmd);
}
