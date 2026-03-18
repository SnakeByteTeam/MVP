import { UpdateUserCmd } from "../../application/commands/update-user-cmd";
import { UpdateUserPort } from "../../application/ports/out/update-user-port.interface";
import { User } from "../../domain/user";

export class UpdateUserAdapter implements UpdateUserPort {
    updateUser(req: UpdateUserCmd): User {
        throw new Error("Method not implemented.");
    }
}
