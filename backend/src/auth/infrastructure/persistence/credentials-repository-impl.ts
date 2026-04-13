import { Inject } from '@nestjs/common';
import { PayloadEntity } from '../entities/payload-entity';
import { PG_POOL } from '../../../database/database.module';
import { CredentialsRepository } from 'src/auth/application/repository/credentials-repository.interface';

export class CredentialsRepositoryImpl implements CredentialsRepository {
  constructor(@Inject(PG_POOL) private readonly conn) {}

  async checkCredentials(
    username: string,
    password: string,
  ): Promise<PayloadEntity> {
    const result = await this.conn.query(
      `SELECT
         u.id AS id,
         u.username AS username,
         CASE
           WHEN r.name = 'Amministratore' THEN 'AMMINISTRATORE'
           WHEN r.name = 'Operatore sanitario' THEN 'OPERATORE_SANITARIO'
           ELSE r.name
         END AS role,
         u.first_access AS first_access
       FROM "user" u
       JOIN role r ON r.id = u.roleId
       WHERE u.username = $1 AND u.password = $2`,
      [username, password],
    );

    if (result.rowCount === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    return new PayloadEntity(
      user.id,
      user.username,
      user.role,
      user.first_access,
    );
  }

  async changeCredentials(
    username: string,
    newPassword: string,
    firstAccess: boolean,
  ): Promise<void> {
    await this.conn.query(
      'UPDATE "user" SET password = $1, first_access = $2 WHERE username = $3',
      [newPassword, firstAccess, username],
    );
  }
}
