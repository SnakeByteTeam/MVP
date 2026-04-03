import type { Plant } from './plant.model';
import type { User } from '../../../core/models/user.model';

export interface Ward {
    id: number;
    name: string;
    apartments: Plant[];
    operators: User[];
}
