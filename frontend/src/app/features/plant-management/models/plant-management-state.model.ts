import type { Ward } from './ward.model';

export interface PlantManagementState {
    wards: Ward[];
    isLoading: boolean;
    error: string | null;
}
