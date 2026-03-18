export interface WriteTokensCachePort {
    writeTokens(accessToken: string, refreshToken: string, expiresAt: Date): Promise<boolean>;
}

export const WRITETOKENSCACHEPORT = Symbol('WriteTokensCachePort');
