import { Payload } from '../../domain/payload';

export interface JwtTokenGeneratorAndExtractor {
    generateAccessToken(payload: Payload): string;
    generateRefreshToken(payload: Payload): string;
    generateChangePasswordAccessToken(payload: Payload): string;
    generateChangePasswordRefreshToken(payload: Payload): string;
    extractAccessTokenPayload(token: string): Payload;
    extractRefreshTokenPayload(token: string): Payload;
}

export const JWT_TOKEN_GENERATOR_AND_EXTRACTOR = 'JWT_TOKEN_GENERATOR_AND_EXTRACTOR';
