import { Payload } from "../../domain/payload";

export interface JwtRefreshTokenExtractor {
    extractRefreshTokenPayload(token: string): Payload;
}
