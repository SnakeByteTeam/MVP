export class TokenPair {
    private readonly accessToken: string; 
    private readonly refreshToken: string; 
    private readonly expiresAt: Date;

    constructor(accessToken: string, refreshToken: string, expiresAt: Date) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
    }

    getAccessToken(): string {
        return this.accessToken;
    }

    getRefreshToken(): string {
        return this.refreshToken;
    }

    getExpiresAt(): Date {
        return this.expiresAt;
    }
}