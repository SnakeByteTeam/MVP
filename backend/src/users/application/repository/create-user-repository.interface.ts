import { CreatedUser } from '../../domain/created-user';
import { UserEntity } from '../../infrastructure/entities/user-entity';

export interface CreateUserRepository {
  createUser(
    username: string,
    surname: string,
    name: string,
    tempPassword: string,
  ): Promise<UserEntity>;
}

export const CREATE_USER_REPOSITORY = 'CREATE_USER_REPOSITORY';
