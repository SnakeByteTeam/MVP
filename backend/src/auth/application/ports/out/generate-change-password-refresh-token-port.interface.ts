import { GenerateChangePasswordRefreshTokenCmd } from "../../commands/generate-change-password-refresh-token-cmd";

export interface GenerateChangePasswordRefreshTokenPort {
    generateChangePasswordRefreshToken(req: GenerateChangePasswordRefreshTokenCmd): string;
}
