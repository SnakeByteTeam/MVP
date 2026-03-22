import { Inject } from "@nestjs/common";
import { GenerateAccessTokenCmd } from "../../application/commands/generate-access-token-cmd";
import { GenerateAccessTokenPort } from "../../application/ports/out/generate-access-token-port.interface";
import { JWT_ACCESS_TOKEN_GENERATOR } from "../../infrastructure/jwt-token-generator/jwt-token-generator";
import { JwtAccessTokenGenerator } from "../../application/token/jwt-access-token-generator.interface";

export class GenerateAccessTokenAdapter implements GenerateAccessTokenPort {
    constructor(
        @Inject(JWT_ACCESS_TOKEN_GENERATOR) private readonly jwtAccessTokenGenerator: JwtAccessTokenGenerator,
    ){}

    generateAccessToken(req: GenerateAccessTokenCmd): string {
        return this.jwtAccessTokenGenerator.generateAccessToken(req.payload);
    }
}
