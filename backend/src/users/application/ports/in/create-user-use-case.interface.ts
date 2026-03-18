import { User } from "../../../domain/user";
import { CreateUserCmd } from "../../commands/create-user-cmd";

export interface CreateUserUseCase {
    createUser(req: CreateUserCmd): User;
}
