export interface OAuthTicketEntity {
  ticket: string;
  userId: number;
  expiresAt: Date;
}
