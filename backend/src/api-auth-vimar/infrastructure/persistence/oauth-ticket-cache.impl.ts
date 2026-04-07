import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from 'src/database/database.module';
import { OAuthTicketEntity } from './entities/oauth-ticket.entity';
import { WriteOAuthTicketCachePort } from 'src/api-auth-vimar/application/repository/write-oauth-ticket-cache.port';
import { ReadOAuthTicketCachePort } from 'src/api-auth-vimar/application/repository/read-oauth-ticket-cache.port';
import { DeleteOAuthTicketCachePort } from 'src/api-auth-vimar/application/repository/delete-oauth-ticket-cache.port';

@Injectable()
export class OAuthTicketCacheImpl
  implements
    WriteOAuthTicketCachePort,
    ReadOAuthTicketCachePort,
    DeleteOAuthTicketCachePort
{
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async writeTicket(
    ticket: string,
    userId: number,
    expiresAt: Date,
  ): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query(
        `INSERT INTO oauth_ticket_cache (ticket, user_id, expires_at)
                VALUES ($1, $2, $3)`,
        [ticket, userId, expiresAt],
      );

      return true;
    } catch {
      return false;
    } finally {
      client.release();
    }
  }

  async readValidTicket(ticket: string): Promise<OAuthTicketEntity | null> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `SELECT ticket, user_id, expires_at
         FROM oauth_ticket_cache
         WHERE ticket = $1
           AND expires_at > NOW()`,
        [ticket],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ticket: row.ticket,
        userId: row.user_id,
        expiresAt: row.expires_at,
      };
    } finally {
      client.release();
    }
  }

  async deleteTicket(ticket: string): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `DELETE FROM oauth_ticket_cache
         WHERE ticket = $1`,
        [ticket],
      );

      return (result.rowCount ?? 0) > 0;
    } catch {
      return false;
    } finally {
      client.release();
    }
  }
}