export interface WriteTokensCachePort {
  writeTokens(
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    userId: number,
    email: string,
  ): Promise<boolean>;
}

export const WRITETOKENSCACHEPORT = Symbol('WriteTokensCachePort');
