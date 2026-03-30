import { UserRole } from "../../../../core/models/user-role.enum";

// User che viene restituito dal backend nelle chiamate GET
export interface UserDto {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    role: UserRole;
}
