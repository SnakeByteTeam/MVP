import { FindAllUsersByWardIdCmd } from "../../application/commands/find-all-users-by-ward-id-cmd";
import { FindAllUsersByWardIdPort } from "../../application/ports/out/find-all-users-by-ward-id-port.interface";

export class FindAllUsersByWardIdAdapter implements FindAllUsersByWardIdPort {
    findAllUsersByWardId(req: FindAllUsersByWardIdCmd) {
        throw new Error("Method not implemented.");
    }
}

export const FIND_ALL_USERS_BY_WARD_ID_PORT = 'FIND_ALL_USERS_BY_WARD_ID_PORT';
