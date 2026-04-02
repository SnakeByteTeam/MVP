export interface DeleteUserRepository {
  deleteUser(id: number): Promise<void>;
}

export const DELETE_USER_REPOSITORY = 'DELETE_USER_REPOSITORY';
