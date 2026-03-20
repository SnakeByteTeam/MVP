import { AddUserToWardCmd } from "../../application/commands/add-user-to-ward-cmd";
import { AddUserToWardPort } from "../../application/ports/out/add-user-to-ward-port.interface";

export class AddUserToWardAdapter implements AddUserToWardPort {
    addUserToWard(req: AddUserToWardCmd) {
        throw new Error("Method not implemented.");
    }
}

export const ADD_USER_TO_WARD_PORT = 'ADD_USER_TO_WARD_PORT';
