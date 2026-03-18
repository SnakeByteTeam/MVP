import { FindAllUsersPort } from "../../application/ports/out/find-all-users-port.interface";
import { User } from "../../domain/user";

export class FindAllUsersAdapter implements FindAllUsersPort {
    findAllUsers(): User[] {
        throw new Error("Method not implemented.");
    }
}
