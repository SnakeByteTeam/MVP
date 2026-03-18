import { Injectable , Inject} from "@nestjs/common";
import { Pool } from "pg";

import { WriteTokensCachePort } from "src/tokens/application/ports/out/write-tokens-cache.port";
import { PG_POOL } from "src/database/database.module"; 


@Injectable()
export class TokenCacheImpl implements WriteTokensCachePort {
    constructor(
        @Inject(PG_POOL) private readonly pool: Pool
    ) {}

    async writeTokens(accessToken: string, refreshToken: string, expiresAt: Date): Promise<boolean> {
        const client = await this.pool.connect();

        try{
            await client.query(
                `INSERT INTO TOKEN_CACHE (access_token, refresh_token, expires_at) 
                VALUES ($1, $2, $3) RETURNING access_token
                ON CONFLICT (lock) DO UPDATE
                    SET access_token = EXCLUDED.access_token,
                        refresh_token = EXCLUDED.refresh_token,
                        expires_at = EXCLUDED.expires_at`,
                [accessToken, refreshToken, expiresAt]
            );
            return true;
        } catch (err) {
            return false;
        }
    }
}