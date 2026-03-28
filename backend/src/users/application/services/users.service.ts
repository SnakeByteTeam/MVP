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
import { GENERATE_PASSWORD_PORT } from '../../infrastructure/password-generator/generate-password-impl';
import { GeneratePasswordPort } from '../ports/out/password-generator-port.interface';
import { HASH_PASSWORD_PORT } from '../../infrastructure/hash-password-impl/hash-password-impl';
import { HashPasswordPort } from '../ports/out/hash-password-port.interface';
import { UserEntity } from '../../infrastructure/entities/user-entity';
import { CONVERT_BASE_64_PORT } from '../../infrastructure/convert-base-64-impl/convert-base-64-impl';
import { ConvertBase64Port } from '../ports/out/converte-base-64-port.interface';
import { CreatedUser } from '../../domain/created-user';
import { CreateUserWithTempPasswordCmd } from '../commands/create-user-with-temp-password-cmd';
import { FindAllAvailableUsersUseCase } from '../ports/in/find-all-available-users-use-case.interface';
import { FIND_ALL_AVAILABLE_USERS_PORT } from '../../adapters/out/find-all-available-users-adapter';
import { FindAllAvailableUsersPort } from '../ports/out/find-all-available-users-port.interface';

@Injectable()
export class UsersService
  implements
    FindAllUsersUseCase,
    FindAllAvailableUsersUseCase,
    UpdateUserUseCase,
    CreateUserUseCase,
    DeleteUserUseCase
{
  constructor(
    @Inject(FIND_ALL_USERS_PORT)
    private readonly findAllUsersPort: FindAllUsersPort,
    @Inject(FIND_ALL_AVAILABLE_USERS_PORT)
    private readonly findAllAvailableUsersPort: FindAllAvailableUsersPort,
    @Inject(UPDATE_USER_PORT) private readonly updateUserPort: UpdateUserPort,
    @Inject(CREATE_USER_PORT) private readonly createUserPort: CreateUserPort,
    @Inject(DELETE_USER_PORT) private readonly deleteUserPort: DeleteUserPort,
    @Inject(GENERATE_PASSWORD_PORT)
    private readonly generatePasswordPort: GeneratePasswordPort,
    @Inject(HASH_PASSWORD_PORT)
    private readonly hashPasswordPort: HashPasswordPort,
    @Inject(CONVERT_BASE_64_PORT)
    private readonly convertBase64Port: ConvertBase64Port,
  ) {}

  async findAllUsers(): Promise<User[]> {
    return await this.findAllUsersPort.findAllUsers();
  }

  async findAllAvailableUsers(): Promise<User[]> {
    return await this.findAllAvailableUsersPort.findAllAvailableUsers();
  }

  async updateUser(req: UpdateUserCmd): Promise<User> {
    return await this.updateUserPort.updateUser(req);
  }

  async createUser(req: CreateUserCmd): Promise<CreatedUser> {
    const password: string = this.generatePasswordPort.generatePassword(128);
    const userEntity: UserEntity = await this.createUserPort.createUser(
      new CreateUserWithTempPasswordCmd(
        req.username,
        req.surname,
        req.name,
        this.hashPasswordPort.hashPassword(password),
      ),
    );

    const base64Password: string = this.convertBase64Port.toBase64(password);

    return new CreatedUser(
      userEntity.id,
      userEntity.username,
      userEntity.surname,
      userEntity.name,
      userEntity.role,
      base64Password,
    );
  }
  deleteUser(req: DeleteUserCmd) {
    return this.deleteUserPort.deleteUser(req);
  }
}

export const FIND_ALL_USERS_USE_CASE = 'FIND_ALL_USERS_USE_CASE';
export const FIND_ALL_AVAILABLE_USERS_USE_CASE =
  'FIND_ALL_AVAILABLE_USERS_USE_CASE';
export const UPDATE_USER_USE_CASE = 'UPDATE_USER_USE_CASE';
export const CREATE_USER_USE_CASE = 'CREATE_USER_USE_CASE';
export const DELETE_USER_USE_CASE = 'DELETE_USER_USE_CASE';
