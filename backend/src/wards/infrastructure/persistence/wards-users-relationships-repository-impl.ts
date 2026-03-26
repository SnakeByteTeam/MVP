import { Inject } from '@nestjs/common';
import { PG_POOL } from '../../../database/database.module';
import { UserEntity } from '../entities/user-entity';
import { AddUserToWardRepository } from '../../application/repository/add-user-to-ward-repository.interface';
import { FindAllUsersByWardIdRepository } from '../../application/repository/find-all-users-by-ward-id-repository.interface';
import { RemoveUserFromWardRepository } from '../../application/repository/remove-user-from-ward-repository.interface';

export class WardsUsersRelationshipsRepositoryImpl
  implements
    AddUserToWardRepository,
    FindAllUsersByWardIdRepository,
    RemoveUserFromWardRepository
{
  constructor(@Inject(PG_POOL) private readonly conn) {}

  async addUserToWard(
    wardId: number,
    userId: number,
  ): Promise<UserEntity> {
    const result = await this.conn.query(
      'WITH inserted AS ( INSERT INTO ward_user (ward_id, user_id) VALUES ($1, $2) RETURNING user_id) SELECT id, username FROM "user" WHERE id = (SELECT user_id FROM inserted)',
      [wardId, userId],
    );

    if (result.rowCount === 0) {
      throw new Error('Add user not found');
    }

    return result.rows;
  }

  async findAllUsersByWardId(wardId: number): Promise<UserEntity[]> {
    
    console.log('wardId:', wardId);

    const result = await this.conn.query(
      'SELECT u.id, u.username FROM "user" u JOIN ward_user wu ON u.id = wu.user_id WHERE wu.ward_id = $1',
      [wardId],
    );

    return result.rows;
  }

  removeUserFromWard(wardId: number, userId: number) {
    throw new Error('Method not implemented.');
  }
}
