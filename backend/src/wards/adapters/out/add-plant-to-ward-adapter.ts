import { AddPlantToWardCmd } from "../../application/commands/add-plant-to-ward-cmd";
import { AddPlantToWardPort } from "../../application/ports/out/add-plant-to-ward-port.interface";

export class AddPlantToWardAdapter implements AddPlantToWardPort {
    addPlantToWard(req: AddPlantToWardCmd) {
        throw new Error("Method not implemented.");
    }
}

export const ADD_PLANT_TO_WARD_PORT = 'ADD_PLANT_TO_WARD_PORT';
