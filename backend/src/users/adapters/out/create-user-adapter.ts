import { CreateUserCmd } from "../../application/commands/create-user-cmd";
import { CreateUserPort } from "../../application/ports/out/create-user-port.interface";
import { User } from "../../domain/user";

export class CreateUserAdapter implements CreateUserPort {
    createUser(req: CreateUserCmd): User {
        throw new Error("Method not implemented.");
    }
}
