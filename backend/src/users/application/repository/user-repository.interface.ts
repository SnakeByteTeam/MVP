import { UserEntity } from '../../infrastructure/entities/user-entity';

export interface UserRepository {
  createUser(
    username: string,
    surname: string,
    name: string,
    tempPassword: string,
  ): Promise<UserEntity>;

  deleteUser(id: number): Promise<void>;

  findAllAvailableUsers(): Promise<UserEntity[]>;

  findAllUsers(): Promise<UserEntity[]>;

  updateUser(
    id: number,
    username: string,
    surname: string,
    name: string,
  ): Promise<UserEntity>;

  findUserById(id: number): Promise<UserEntity | null>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
