export interface DeleteOAuthTicketCachePort {
  deleteTicket(ticket: string): Promise<boolean>;
}

export const DELETEOAUTHTICKETCACHEPORT = 'DELETEOAUTHTICKETCACHEPORT';
