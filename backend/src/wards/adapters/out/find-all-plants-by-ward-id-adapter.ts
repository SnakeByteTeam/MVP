import { FindAllPlantsByWardIdCmd } from "../../application/commands/find-all-plants-by-ward-id-cmd";
import { FindAllPlantsByWardIdPort } from "../../application/ports/out/find-all-plants-by-ward-id-port.interface";

export class FindAllPlantsByWardIdAdapter implements FindAllPlantsByWardIdPort {
    findAllPlantsByWardId(req: FindAllPlantsByWardIdCmd) {
        throw new Error("Method not implemented.");
    }
}

export const FIND_ALL_PLANTS_BY_WARD_ID_PORT = 'FIND_ALL_PLANTS_BY_WARD_ID_PORT';
