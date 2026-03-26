import { Tokens } from "../../../domain/tokens";
import { FirstLoginCmd } from "../../commands/first-login-cmd";

export interface FirstLoginUseCase {
    firstLogin(req: FirstLoginCmd): Promise<Tokens>;
}
