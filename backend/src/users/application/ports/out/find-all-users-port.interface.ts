import { User } from "../../../domain/user";

export interface FindAllUsersPort {
    findAllUsers(): User[];
}
