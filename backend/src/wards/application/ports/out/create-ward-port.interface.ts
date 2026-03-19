import { Ward } from "../../../domain/ward";
import { CreateWardCmd } from "../../commands/create-ward-cmd";

export interface CreateWardPort {
    createWard(req: CreateWardCmd): Ward;
}
