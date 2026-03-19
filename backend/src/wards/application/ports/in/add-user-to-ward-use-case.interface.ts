import { AddUserToWardCmd } from "../../commands/add-user-to-ward-cmd";

export interface AddUserToWardUseCase {
    addUserToWard(req: AddUserToWardCmd);
}
