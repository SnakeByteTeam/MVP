import { Inject, Injectable } from '@nestjs/common';
import {
  type OAuthTicketPort,
  OAUTHTICKETPORT,
} from 'src/api-auth-vimar/application/ports/out/oauth-ticket.port';
import {
  type WriteOAuthTicketCachePort,
  WRITEOAUTHTICKETCACHEPORT,
} from 'src/api-auth-vimar/application/repository/write-oauth-ticket-cache.port';
import {
  type ReadOAuthTicketCachePort,
  READOAUTHTICKETCACHEPORT,
} from 'src/api-auth-vimar/application/repository/read-oauth-ticket-cache.port';
import {
  type DeleteOAuthTicketCachePort,
  DELETEOAUTHTICKETCACHEPORT,
} from 'src/api-auth-vimar/application/repository/delete-oauth-ticket-cache.port';

@Injectable()
export class OAuthTicketAdapter implements OAuthTicketPort {
  constructor(
    @Inject(WRITEOAUTHTICKETCACHEPORT)
    private readonly writeOAuthTicketCachePort: WriteOAuthTicketCachePort,
    @Inject(READOAUTHTICKETCACHEPORT)
    private readonly readOAuthTicketCachePort: ReadOAuthTicketCachePort,
    @Inject(DELETEOAUTHTICKETCACHEPORT)
    private readonly deleteOAuthTicketCachePort: DeleteOAuthTicketCachePort,
  ) {}

  async saveTicket(
    ticket: string,
    userId: number,
    expiresAt: Date,
  ): Promise<boolean> {
    return this.writeOAuthTicketCachePort.writeTicket(ticket, userId, expiresAt);
  }

  async consumeTicket(ticket: string): Promise<number | null> {
    const persistedTicket = await this.readOAuthTicketCachePort.readValidTicket(
      ticket,
    );

    if (!persistedTicket) {
      return null;
    }

    const deleted = await this.deleteOAuthTicketCachePort.deleteTicket(ticket);
    if (!deleted) {
      throw new Error('Unable to consume OAuth ticket');
    }

    return persistedTicket.userId;
  }
}