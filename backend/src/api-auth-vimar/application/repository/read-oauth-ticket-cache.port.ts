export interface ReadOAuthTicketCacheEntity {
  ticket: string;
  userId: number;
  expiresAt: Date;
}

export interface ReadOAuthTicketCachePort {
  readValidTicket(ticket: string): Promise<ReadOAuthTicketCacheEntity | null>;
}

export const READOAUTHTICKETCACHEPORT = 'READOAUTHTICKETCACHEPORT';
