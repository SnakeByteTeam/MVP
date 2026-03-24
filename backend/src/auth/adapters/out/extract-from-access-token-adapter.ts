import { Inject } from "@nestjs/common";
import { ExtractFromAccessTokenCmd } from "../../application/commands/extract-from-access-token-cmd";
import { ExtractFromAccessTokenPort } from "../../application/ports/out/extract-from-access-token-port.interface";
import { Payload } from "../../domain/payload";
import { JWT_ACCESS_TOKEN_EXTRACTOR } from "../../infrastructure/jwt-token-generator/jwt-token-generator";
import { JwtAccessTokenExtractor } from "../../application/token/jwt-access-token-extractor.interface";

export class ExtractFromAccessTokenAdapter implements ExtractFromAccessTokenPort {

    constructor(
        @Inject(JWT_ACCESS_TOKEN_EXTRACTOR) private readonly jwtAccessTokenExtractor: JwtAccessTokenExtractor
    ){}

    extractFromAccessToken(req: ExtractFromAccessTokenCmd): Payload {
        return this.jwtAccessTokenExtractor.extractAccessTokenPayload(req.token);
    }
}

export const EXTRACT_FROM_ACCESS_TOKEN_PORT = 'EXTRACT_FROM_ACCESS_TOKEN_PORT';
