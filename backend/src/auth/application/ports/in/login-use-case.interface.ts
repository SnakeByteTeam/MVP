import { LoginCmd } from "../../commands/login-cmd";

export interface LoginUseCase {
    login(req: LoginCmd);
}
