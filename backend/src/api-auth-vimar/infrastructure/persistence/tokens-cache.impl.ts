import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { Logger } from '@nestjs/common';

import { WriteTokensCachePort } from 'src/api-auth-vimar/application/repository/write-tokens-cache.port';
import { PG_POOL } from 'src/database/database.module';
import { ReadTokensCachePort } from 'src/api-auth-vimar/application/repository/read-tokens-cache.port';
import { DeleteTokensCachePort } from 'src/api-auth-vimar/application/repository/delete-tokens-cache.port';
import { TokenEntity } from './entities/tokens.entity';
import { ReadStatusRepoPort } from 'src/api-auth-vimar/application/repository/read-status.repository';

@Injectable()
export class TokenCacheImpl
  implements WriteTokensCachePort, ReadTokensCachePort, DeleteTokensCachePort, ReadStatusRepoPort
{
  private readonly logger = new Logger(TokenCacheImpl.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async writeTokens(
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    userId: number,
    email: string,
  ): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO token_cache (access_token, refresh_token, expires_at, user_id, email) 
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (lock) DO UPDATE
                    SET access_token = EXCLUDED.access_token,
                        refresh_token = EXCLUDED.refresh_token,
                        expires_at = EXCLUDED.expires_at
                RETURNING access_token`,
        [accessToken, refreshToken, expiresAt, userId, email],
      );
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed writing token_cache row: ${message}`, stack);
      return false;
    } finally {
      client.release();
    }
  }

  async readTokens(): Promise<TokenEntity | null> {
    const client = await this.pool.connect();

    try {
      const result = await client.query<{
        access_token: string;
        refresh_token: string;
        expires_at: Date;
        user_id: number;
        email: string;
      }>(`SELECT * FROM token_cache`);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        expiresAt: row.expires_at,
        userId: row.user_id,
        email: row.email,
      };

    } finally {
      client.release();
    }
  }

  async deleteTokens(): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query('DELETE FROM token_cache');
      return true;
    } catch {
      return false;
    } finally {
      client.release();
    }
  }

  async readStatus(userId: number): Promise<string | null> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        `SELECT email FROM token_cache WHERE user_id = $1`,
        [userId],
      );
      return result.rows[0]?.email || null;

    } finally {
      client.release();
    }
  }
}
