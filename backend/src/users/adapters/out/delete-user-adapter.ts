import { DeleteUserCmd } from "../../application/commands/delete-user-cmd";
import { DeleteUserPort } from "../../application/ports/out/delete-user-port.interface";

export class DeleteUserAdapter implements DeleteUserPort {
    deleteUser(req: DeleteUserCmd): void {
        throw new Error("Method not implemented.");
    }
}
