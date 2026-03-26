import { Payload } from "../../domain/payload";

export interface JwtChangePasswordRefreshTokenGenerator {
    generateChangePasswordRefreshToken(payload: Payload): string;
}