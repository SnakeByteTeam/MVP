import { User } from "../../../domain/user";
import { UpdateUserCmd } from "../../commands/update-user-cmd";

export interface UpdateUserPort {
    updateUser(req: UpdateUserCmd): User;
}
