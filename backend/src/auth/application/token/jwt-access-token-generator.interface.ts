import { Payload } from "../../domain/payload";

export interface JwtAccessTokenGenerator {
    generateAccessToken(payload: Payload): string;
}
