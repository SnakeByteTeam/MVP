import type { Ward } from './ward.model';

export interface WardManagementState {
    wards: Ward[];
    isLoading: boolean;
    error: string | null;
}
