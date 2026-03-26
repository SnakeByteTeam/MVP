import { UserEntity } from '../../infrastructure/entities/user-entity';

export interface AddUserToWardRepository {
  addUserToWard(wardId: number, userId: number): Promise<UserEntity>;
}

export const ADD_USER_TO_WARD_REPOSITORY = 'ADD_USER_TO_WARD_REPOSITORY';
