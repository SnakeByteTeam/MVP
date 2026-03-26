import { GenerateChangePasswordAccessTokenCmd } from "../../commands/generate-change-password-access-token-cmd";

export interface GenerateChangePasswordAccessTokenPort {
    generateChangePasswordAccessToken(req: GenerateChangePasswordAccessTokenCmd): string;
}
