import { GenerateRefreshTokenCmd } from "../../commands/generate-refresh-token-cmd";

export interface GenerateRefreshTokenPort {
    generateRefreshToken(req: GenerateRefreshTokenCmd): string;
}
