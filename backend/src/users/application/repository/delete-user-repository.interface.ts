export interface DeleteUserRepository {
    DeleteUserAdapter(
        id: number
    ): void;
}

export const DELETE_USER_REPOSITORY = 'DELETE_USER_REPOSITORY';