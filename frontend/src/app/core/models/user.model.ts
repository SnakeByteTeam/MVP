import type { UserRole } from './user-role.enum';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    role: UserRole;
}
