export interface RemoveUserFromWardRepository {
  removeUserFromWard(wardId: number, userId: number): Promise<void>;
}

export const REMOVE_USER_FROM_WARD_REPOSITORY =
  'REMOVE_USER_FROM_WARD_REPOSITORY';
