import { User } from "../../../domain/user";
import { UpdateUserCmd } from "../../commands/update-user-cmd";

export interface UpdateUserUseCase {
    updateUser(req: UpdateUserCmd): User
}
