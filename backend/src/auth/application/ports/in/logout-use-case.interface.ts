import { LogoutCmd } from "../../commands/logout-cmd";

export interface LogoutUseCase {
    logout(req: LogoutCmd);
}
