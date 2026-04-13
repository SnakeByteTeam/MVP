import { Inject } from '@nestjs/common';
import { GenerateRefreshTokenCmd } from '../../application/commands/generate-refresh-token-cmd';
import { GenerateRefreshTokenPort } from '../../application/ports/out/generate-refresh-token-port.interface';
import { GenerateAccessTokenPort } from 'src/auth/application/ports/out/generate-access-token-port.interface';
import { GenerateChangePasswordAccessTokenPort } from 'src/auth/application/ports/out/generate-change-password-access-token-port.interface';
import { GenerateChangePasswordRefreshTokenPort } from 'src/auth/application/ports/out/generate-change-password-refresh-token-port.interface';
import { GenerateAccessTokenCmd } from 'src/auth/application/commands/generate-access-token-cmd';
import { JWT_TOKEN_GENERATOR_AND_EXTRACTOR, JwtTokenGeneratorAndExtractor } from 'src/auth/application/token/jwt-token-generator-and-extractor.interface';
import { GenerateChangePasswordRefreshTokenCmd } from 'src/auth/application/commands/generate-change-password-refresh-token-cmd';
import { GenerateChangePasswordAccessTokenCmd } from 'src/auth/application/commands/generate-change-password-access-token-cmd';
import { ExtractFromRefreshTokenCmd } from 'src/auth/application/commands/extract-from-refresh-token-cmd';
import { ExtractFromAccessTokenCmd } from 'src/auth/application/commands/extract-from-access-token-cmd';
import { Payload } from 'src/auth/domain/payload';

export class GenerateAndExtractTokenAdapter implements
    GenerateRefreshTokenPort,
    GenerateAccessTokenPort,
    GenerateChangePasswordAccessTokenPort,
    GenerateChangePasswordRefreshTokenPort {
    constructor(
        @Inject(JWT_TOKEN_GENERATOR_AND_EXTRACTOR)
        private readonly jwtTokenGeneratorAndExtractor: JwtTokenGeneratorAndExtractor,
    ) { }

    generateRefreshToken(req: GenerateRefreshTokenCmd): string {
        return this.jwtTokenGeneratorAndExtractor.generateRefreshToken(req.payload);
    }

    generateAccessToken(req: GenerateAccessTokenCmd): string {
        return this.jwtTokenGeneratorAndExtractor.generateAccessToken(req.payload);
    }

    generateChangePasswordRefreshToken(
        req: GenerateChangePasswordRefreshTokenCmd,
    ): string {
        return this.jwtTokenGeneratorAndExtractor.generateChangePasswordRefreshToken(
            req.payload,
        );
    }

    generateChangePasswordAccessToken(
        req: GenerateChangePasswordAccessTokenCmd,
    ): string {
        return this.jwtTokenGeneratorAndExtractor.generateChangePasswordAccessToken(
            req.payload,
        );
    }

    extractFromAccessToken(req: ExtractFromAccessTokenCmd): Payload {
        return this.jwtTokenGeneratorAndExtractor.extractAccessTokenPayload(req.token);
    }

    extractFromRefreshToken(req: ExtractFromRefreshTokenCmd): Payload {
        return this.jwtTokenGeneratorAndExtractor.extractRefreshTokenPayload(req.token);
    }
}

export const GENERATE_REFRESH_TOKEN_PORT = 'GENERATE_REFRESH_TOKEN_PORT';
