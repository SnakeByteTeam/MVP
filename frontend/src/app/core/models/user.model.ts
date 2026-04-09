import type { UserRole } from './user-role.enum';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    role: UserRole;
}
