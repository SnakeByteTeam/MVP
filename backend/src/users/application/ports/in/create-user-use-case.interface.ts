import { CreatedUser } from "../../../domain/created-user";
import { CreateUserCmd } from "../../commands/create-user-cmd";

export interface CreateUserUseCase {
    createUser(req: CreateUserCmd): CreatedUser;
}
