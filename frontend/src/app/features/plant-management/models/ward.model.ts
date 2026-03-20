import type { Apartment } from './apartment.model';
import type { User } from '../../../core/models/user.model';

export interface Ward {
    id: string;
    name: string;
    apartments: Apartment[];
    operators: User[];
}
