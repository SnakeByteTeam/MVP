import {UserRole} from '../../features/user-management/models/user-role.enum'

export interface NavItem {
    label: string;
    icon: string;
    route: string;
    requiredRole?: UserRole;
}
