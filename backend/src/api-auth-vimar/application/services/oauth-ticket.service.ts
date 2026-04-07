import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrepareOAuthUseCase } from '../ports/in/prepare-oauth.usecase';
import { AuthorizeOAuthUseCase } from '../ports/in/authorize-oauth.usecase';
import {
  OAUTHTICKETPORT,
  type OAuthTicketPort,
} from '../ports/out/oauth-ticket.port';

@Injectable()
export class OAuthTicketService
  implements PrepareOAuthUseCase, AuthorizeOAuthUseCase
{
  private static readonly TICKET_TTL_MS = 60_000;

  constructor(
    @Inject(OAUTHTICKETPORT)
    private readonly oauthTicketPort: OAuthTicketPort,
  ) {}

  async prepareOAuth(userId: number): Promise<string> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user identity');
    }

    const ticket = randomUUID();
    const expiresAt = new Date(Date.now() + OAuthTicketService.TICKET_TTL_MS);

    const saved = await this.oauthTicketPort.saveTicket(ticket, userId, expiresAt);
    if (!saved) {
      throw new Error('Unable to persist OAuth ticket');
    }

    return ticket;
  }

  async authorizeOAuth(ticket: string): Promise<number | null> {
    const trimmedTicket = ticket?.trim();

    if (!trimmedTicket) {
      return null;
    }

    return this.oauthTicketPort.consumeTicket(trimmedTicket);
  }
}