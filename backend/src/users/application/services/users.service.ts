import { Injectable } from '@nestjs/common';
import { FindAllUsersUseCase } from '../ports/in/find-all-users-use-case.interface';
import { UpdateUserUseCase } from '../ports/in/update-user-use-case.interface';
import { CreateUserUseCase } from '../ports/in/create-user-use-case.interface';
import { DeleteUserUseCase } from '../ports/in/delete-user-use-case.interface';
import { User } from '../../domain/user';
import { UpdateUserCmd } from '../commands/update-user-cmd';
import { DeleteUserCmd } from '../commands/delete-user-cmd';
import { CreateUserCmd } from '../commands/create-user-cmd';

@Injectable()
export class UsersService implements FindAllUsersUseCase, UpdateUserUseCase, CreateUserUseCase, DeleteUserUseCase
{
    findAllUsers(): User[] {
        throw new Error('Method not implemented.');
    }
    updateUser(req: UpdateUserCmd): User {
        throw new Error('Method not implemented.');
    }
    createUser(req: CreateUserCmd): User {
        throw new Error('Method not implemented.');
    }
    deleteUser(req: DeleteUserCmd) {
        throw new Error('Method not implemented.');
    }
    
}

export const FIND_ALL_USERS_USE_CASE = 'FIND_ALL_USERS_USE_CASE';
export const UPDATE_USER_USE_CASE = 'UPDATE_USER_USE_CASE';
export const CREATE_USER_USE_CASE = 'CREATE_USER_USE_CASE';
export const DELETE_USER_USE_CASE = 'DELETE_USER_USE_CASE';
