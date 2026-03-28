import { Inject } from '@nestjs/common';
import { PG_POOL } from '../../../database/database.module';
import { CreateUserRepository } from '../../application/repository/create-user-repository.interface';
import { DeleteUserRepository } from '../../application/repository/delete-user-repository.interface';
import { FindAllUsersRepository } from '../../application/repository/find-all-users-repository.interface';
import { UpdateUserRepository } from '../../application/repository/update-user-repository.interface';
import { UserEntity } from '../entities/user-entity';
import { FindAllAvailableUsersRepository } from '../../application/repository/find-all-available-users-repository.interface';
import { User } from '../../domain/user';

export class UsersRepositoryImpl
  implements
    FindAllUsersRepository,
    FindAllAvailableUsersRepository,
    UpdateUserRepository,
    CreateUserRepository,
    DeleteUserRepository
{
  constructor(@Inject(PG_POOL) private readonly conn) {}

  async findAllUsers(): Promise<UserEntity[]> {
    const result = await this.conn.query(
      ' SELECT u.id, u.username, u.surname, u.name, r.name AS role FROM "user" u LEFT JOIN role r ON u.roleId = r.id;',
    );

    return result.rows;
  }

  async findAllAvailableUsers(): Promise<UserEntity[]> {
    const result = await this.conn.query(
      ' SELECT u.id, u.username, u.surname, u.name, r.name AS role FROM "user" u LEFT JOIN role r ON u.roleId = r.id ' +
        'WHERE u.id NOT IN (SELECT user_id FROM ward_user) ',
    );

    return result.rows;
  }

  async updateUser(
    id: number,
    username: string,
    surname: string,
    name: string,
  ): Promise<UserEntity> {
    const result = await this.conn.query(
      ' WITH updated_user AS ( UPDATE "user" SET username = $1, surname = $2, name = $3 WHERE id = $4 RETURNING * )' +
        ' SELECT u.id, u.username, u.surname, u.name, u.password, u.temp_password, u.roleId, r.id AS role_id, r.title AS role ' +
        ' FROM updated_user u LEFT JOIN role r ON u.roleId = r.id;',
      [username, surname, name, id],
    );

    if (result.rowCount === 0) {
      throw new Error('Update user not found');
    }

    return result.rows[0];
  }
  async createUser(
    username: string,
    surname: string,
    name: string,
    tempPassword: string,
  ): Promise<UserEntity> {
    const result = await this.conn.query(
      ' WITH created_user AS ( INSERT INTO "user" (username, surname, name, temp_password) VALUES ($1, $2, $3, $4) RETURNING * ) ' +
        ' SELECT u.id, u.username, u.surname, u.name, r.title AS role FROM created_user u LEFT JOIN role r ON u.roleId = r.id;',
      [username, surname, name, tempPassword],
    );

    if (result.rowCount === 0) {
      throw new Error('Create user not found');
    }

    return result.rows[0];
  }
  deleteUser(id: number): void {
    throw new Error('Method not implemented.');
  }
}
