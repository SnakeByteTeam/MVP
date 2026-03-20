import { Inject, Injectable } from '@nestjs/common';
import { FindAllUsersUseCase } from '../ports/in/find-all-users-use-case.interface';
import { UpdateUserUseCase } from '../ports/in/update-user-use-case.interface';
import { CreateUserUseCase } from '../ports/in/create-user-use-case.interface';
import { DeleteUserUseCase } from '../ports/in/delete-user-use-case.interface';
import { User } from '../../domain/user';
import { UpdateUserCmd } from '../commands/update-user-cmd';
import { DeleteUserCmd } from '../commands/delete-user-cmd';
import { CreateUserCmd } from '../commands/create-user-cmd';
import { FIND_ALL_USERS_PORT } from '../../adapters/out/find-all-users-adapter';
import { FindAllUsersPort } from '../ports/out/find-all-users-port.interface';
import { UPDATE_USER_PORT } from '../../adapters/out/update-user-adapter';
import { UpdateUserPort } from '../ports/out/update-user-port.interface';
import { CREATE_USER_PORT } from '../../adapters/out/create-user-adapter';
import { CreateUserPort } from '../ports/out/create-user-port.interface';
import { DELETE_USER_PORT } from '../../adapters/out/delete-user-adapter';
import { DeleteUserPort } from '../ports/out/delete-user-port.interface';
import { PASSWORD_GENERATOR_PORT } from '../../infrastructure/password-generator/password-generator';
import { PasswordGeneratorPort } from '../ports/out/password-generator-port.interface';

@Injectable()
export class UsersService implements FindAllUsersUseCase, UpdateUserUseCase, CreateUserUseCase, DeleteUserUseCase
{

    constructor(
        @Inject(FIND_ALL_USERS_PORT) private readonly findAllUsersPort: FindAllUsersPort,
        @Inject(UPDATE_USER_PORT) private readonly updateUserPort: UpdateUserPort,
        @Inject(CREATE_USER_PORT) private readonly createUserPort: CreateUserPort,
        @Inject(DELETE_USER_PORT) private readonly deleteUserPort: DeleteUserPort,
        @Inject(PASSWORD_GENERATOR_PORT) private readonly passwordGeneratorPort: PasswordGeneratorPort
    ){}

    findAllUsers(): User[] {
        return this.findAllUsersPort.findAllUsers();
    }
    updateUser(req: UpdateUserCmd): User {
        return this.updateUserPort.updateUser(req);
    }
    createUser(req: CreateUserCmd): User {
        req.tempPassword = this.passwordGeneratorPort.generatePassword(128);
        return this.createUserPort.createUser(req);
    }
    deleteUser(req: DeleteUserCmd) {
        return this.deleteUserPort.deleteUser(req);
    }
    
}

export const FIND_ALL_USERS_USE_CASE = 'FIND_ALL_USERS_USE_CASE';
export const UPDATE_USER_USE_CASE = 'UPDATE_USER_USE_CASE';
export const CREATE_USER_USE_CASE = 'CREATE_USER_USE_CASE';
export const DELETE_USER_USE_CASE = 'DELETE_USER_USE_CASE';
