export class TokenPair {
    private accessToken: string; 
    private refreshToken: string; 
    private expiresAt: Date;

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