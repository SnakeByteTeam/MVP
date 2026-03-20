import { UserRole } from '../../../core/models/user-role.enum';

export interface UserSession {
	userId: string;
	username: string;
	role: UserRole;
	token: string;
	isFirstAccess: boolean;
}
