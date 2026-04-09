export interface OAuthTicketPort {
  saveTicket(ticket: string, userId: number, expiresAt: Date): Promise<boolean>;
  consumeTicket(ticket: string): Promise<number | null>;
}

export const OAUTHTICKETPORT = 'OAUTHTICKETPORT';
