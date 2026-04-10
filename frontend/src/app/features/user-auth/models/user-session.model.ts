import { UserRole } from '../../user-management/models/user-role.enum';

export interface UserSession {
	userId: string;
	username: string;
	role: UserRole;
	accessToken: string;
	isFirstAccess: boolean;
}
