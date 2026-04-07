export interface WriteOAuthTicketCachePort {
  writeTicket(ticket: string, userId: number, expiresAt: Date): Promise<boolean>;
}

export const WRITEOAUTHTICKETCACHEPORT = 'WRITEOAUTHTICKETCACHEPORT';