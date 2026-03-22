import { GenerateAccessTokenCmd } from "../../commands/generate-access-token-cmd";

export interface GenerateAccessTokenPort {
    generateAccessToken(req: GenerateAccessTokenCmd): string;
}
