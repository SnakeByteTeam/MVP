export interface RemoveUserFromWardRepository {
  removeUserFromWard(wardId: number, userId: number);
}

export const REMOVE_USER_FROM_WARD_REPOSITORY =
  'REMOVE_USER_FROM_WARD_REPOSITORY';
