import { Ward } from "../../../domain/ward";
import { UpdateWardCmd } from "../../commands/update-ward-cmd";

export interface UpdateWardPort {
    updateWard(req: UpdateWardCmd): Ward;
}
