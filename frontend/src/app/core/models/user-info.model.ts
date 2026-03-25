import {UserRole} from './user-role.enum'

export interface UserInfo {
    username: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}


