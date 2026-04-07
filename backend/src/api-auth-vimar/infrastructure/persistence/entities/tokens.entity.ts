export interface TokenEntity {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  userId: number;
  email: string;
}
