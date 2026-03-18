import { Ward } from "../../../domain/ward";
import { UpdateWardCmd } from "../../commands/update-ward-cmd";

export interface UpdateWardUseCase {
    updateWard(req: UpdateWardCmd): Ward;
}
