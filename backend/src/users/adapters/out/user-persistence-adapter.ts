import { CreateUserWithTempPasswordCmd } from '../../application/commands/create-user-with-temp-password-cmd';
import { UpdateUserCmd } from '../../application/commands/update-user-cmd';
import { FindUserByIdCmd } from '../../application/commands/find-user-by-id-cmd';
import { DeleteUserCmd } from '../../application/commands/delete-user-cmd';
import { CreateUserPort } from '../../application/ports/out/create-user-port.interface';
import { DeleteUserPort } from '../../application/ports/out/delete-user-port.interface';
import { FindAllUsersPort } from '../../application/ports/out/find-all-users-port.interface';
import { FindUserByIdPort } from '../../application/ports/out/find-user-by-id-port.interface';
import { UpdateUserPort } from '../../application/ports/out/update-user-port.interface';
import { User } from '../../domain/user';
import { FindAllAvailableUsersPort } from '../../application/ports/out/find-all-available-users-port.interface';
import { Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../application/repository/user-repository.interface';
import { UserEntity } from '../../infrastructure/entities/user-entity';

export class UserPersistenceAdapter
  implements
    CreateUserPort,
    UpdateUserPort,
    FindAllUsersPort,
    FindAllAvailableUsersPort,
    FindUserByIdPort,
    DeleteUserPort
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async createUser(req: CreateUserWithTempPasswordCmd): Promise<User> {
    const res: UserEntity = await this.userRepository.createUser(
      req.username,
      req.surname,
      req.name,
      req.tempPassword,
    );

    return new User(res.id, res.username, res.surname, res.name, res.role);
  }
  async updateUser(req: UpdateUserCmd): Promise<User> {
    const userEntity: UserEntity = await this.userRepository.updateUser(
      req.id,
      req.username,
      req.surname,
      req.name,
    );

    return new User(
      userEntity.id,
      userEntity.username,
      userEntity.surname,
      userEntity.name,
      userEntity.role,
    );
  }
  async findUserById(req: FindUserByIdCmd): Promise<User | null> {
    const userEntity: UserEntity | null =
      await this.userRepository.findUserById(req.id);

    if (userEntity == null) {
      return null;
    }

    return new User(
      userEntity.id,
      userEntity.username,
      userEntity.surname,
      userEntity.name,
      userEntity.role,
    );
  }
  async findAllUsers(): Promise<User[]> {
    const userEntities: UserEntity[] = await this.userRepository.findAllUsers();

    return userEntities.map(
      (element) =>
        new User(
          element.id,
          element.username,
          element.surname,
          element.name,
          element.role,
        ),
    );
  }
  async findAllAvailableUsers(): Promise<User[]> {
    const res: UserEntity[] = await this.userRepository.findAllAvailableUsers();

    return res.map(
      (element) =>
        new User(
          element.id,
          element.username,
          element.surname,
          element.name,
          element.role,
        ),
    );
  }
  async deleteUser(req: DeleteUserCmd): Promise<void> {
    return await this.userRepository.deleteUser(req.id);
  }
}
