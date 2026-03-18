import { User } from "../../../domain/user";
import { CreateUserCmd } from "../../commands/create-user-cmd";

export interface CreateUserPort {
    createUser(req: CreateUserCmd): User;
}