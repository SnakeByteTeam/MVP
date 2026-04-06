import { Inject } from '@nestjs/common';
import { PG_POOL } from '../../../database/database.module';
import { UserEntity } from '../entities/user-entity';
import { UserRepository } from '../../application/repository/user-repository.interface';
export class UsersRepositoryImpl implements UserRepository {
  constructor(@Inject(PG_POOL) private readonly conn) {}

  async findAllUsers(): Promise<UserEntity[]> {
    const result = await this.conn.query(
      `SELECT u.id, u.username, u.surname, u.name, r.name AS role 
      FROM "user" u 
      LEFT JOIN role r ON u.roleId = r.id;`,
    );

    return result.rows;
  }

  async findUserById(id: number): Promise<UserEntity | null> {
    const result = await this.conn.query(
      `SELECT u.id, u.username, u.surname, u.name, r.name AS role 
      FROM "user" u LEFT JOIN role r ON u.roleId = r.id 
      WHERE u.id = $1;`,
      [id],
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findAllAvailableUsers(): Promise<UserEntity[]> {
    const result = await this.conn.query(
      `SELECT u.id, u.username, u.surname, u.name, r.name AS role 
      FROM "user" u LEFT JOIN role r ON u.roleId = r.id
      WHERE u.id NOT IN (SELECT user_id FROM ward_user);`,
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
      `WITH updated_user AS ( UPDATE "user" SET username = $1, surname = $2, name = $3 WHERE id = $4 RETURNING * ) 
      SELECT u.id, u.username, u.surname, u.name, u.password, u.temp_password, u.roleId, r.id AS role_id, r.name AS role 
      FROM updated_user u LEFT JOIN role r ON u.roleId = r.id;`,
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
    const roleRes = await this.conn.query(
      `SELECT id FROM role WHERE name = $1 LIMIT 1;`,
      ['Operatore sanitario'],
    );

    let roleId: number = 1;
    if (roleRes.rows.length) {
      roleId = roleRes.rows[0].id;
    }

    const result = await this.conn.query(
      `WITH created_user AS (
         INSERT INTO "user" (username, surname, name, temp_password, roleId)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *
       )
       SELECT u.id, u.username, u.surname, u.name, r.name AS role
       FROM created_user u
       LEFT JOIN role r ON u.roleId = r.id;`,
      [username, surname, name, tempPassword, roleId],
    );

    if (result.rowCount === 0) {
      throw new Error('Create user not found');
    }

    return result.rows[0];
  }
  async deleteUser(id: number): Promise<void> {
    await this.conn.query(`DELETE FROM "user" WHERE id = $1;`, [id]);
  }
}
