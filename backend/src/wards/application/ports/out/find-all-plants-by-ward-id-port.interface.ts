import { FindAllPlantsByWardIdCmd } from "../../commands/find-all-plants-by-ward-id-cmd";

export interface FindAllPlantsByWardIdPort {
    findAllPlantsByWardId(req: FindAllPlantsByWardIdCmd);
}
