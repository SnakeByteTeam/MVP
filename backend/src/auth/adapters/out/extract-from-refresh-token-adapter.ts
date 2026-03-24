import { Inject } from "@nestjs/common";
import { ExtractFromRefreshTokenCmd } from "../../application/commands/extract-from-refresh-token-cmd";
import { ExtractFromRefreshTokenPort } from "../../application/ports/out/extract-from-refresh-token-port.interface";
import { Payload } from "../../domain/payload";
import { JWT_REFRESH_TOKEN_EXTRACTOR } from "../../infrastructure/jwt-token-generator/jwt-token-generator";
import { JwtRefreshTokenExtractor } from "../../application/token/jwt-refresh-token-extractor.interface";

export class ExtractFromRefreshTokenAdapter implements ExtractFromRefreshTokenPort {

    constructor(
        @Inject(JWT_REFRESH_TOKEN_EXTRACTOR) private readonly jwtRefreshTokenExtractor: JwtRefreshTokenExtractor
    ){}

    extractFromRefreshToken(req: ExtractFromRefreshTokenCmd): Payload {
        return this.jwtRefreshTokenExtractor.extractRefreshTokenPayload(req.token);
    }
}

export const EXTRACT_FROM_REFRESH_TOKEN_PORT = 'EXTRACT_FROM_REFRESH_TOKEN_PORT';
