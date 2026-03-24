import { Tokens } from "../../../domain/tokens";
import { LoginCmd } from "../../commands/login-cmd";

export interface LoginUseCase {
    login(req: LoginCmd): Tokens;
}
