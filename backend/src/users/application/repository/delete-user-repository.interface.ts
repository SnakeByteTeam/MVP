export interface DeleteUserRepository {
    deleteUser(
        id: number
    ): void;
}

export const DELETE_USER_REPOSITORY = 'DELETE_USER_REPOSITORY';