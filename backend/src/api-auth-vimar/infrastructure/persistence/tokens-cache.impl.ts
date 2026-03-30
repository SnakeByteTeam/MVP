import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

import { WriteTokensCachePort } from 'src/api-auth-vimar/application/repository/write-tokens-cache.port';
import { PG_POOL } from 'src/database/database.module';
import { ReadTokensCachePort } from 'src/api-auth-vimar/application/repository/read-tokens-cache.port';
import { TokenEntity } from './entities/tokens.entity';

@Injectable()
export class TokenCacheImpl
  implements WriteTokensCachePort, ReadTokensCachePort
{
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async writeTokens(
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query(
        `INSERT INTO TOKEN_CACHE (access_token, refresh_token, expires_at) 
                VALUES ($1, $2, $3)
                ON CONFLICT (lock) DO UPDATE
                    SET access_token = EXCLUDED.access_token,
                        refresh_token = EXCLUDED.refresh_token,
                        expires_at = EXCLUDED.expires_at
                RETURNING access_token`,
        [accessToken, refreshToken, expiresAt],
      );
      return true;
    } catch {
      return false;
    } finally {
      client.release();
    }
  }

  async readTokens(): Promise<TokenEntity | null> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(`SELECT * FROM TOKEN_CACHE`);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const tokens: TokenEntity = {
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        expiresAt: row.expires_at,
      };

      return tokens;
    } finally {
      client.release();
    }
  }
}
