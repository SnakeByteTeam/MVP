import { CheckCredentialsCmd } from "../../application/commands/check-credentials-cmd";
import { CheckCredentialsPort } from "../../application/ports/out/check-credentials-port.interface";

export class CheckCredentialsAdapter implements CheckCredentialsPort {
    checkCredentials(req: CheckCredentialsCmd) {
        throw new Error("Method not implemented.");
    }
}

export const CHECK_CREDENTIALS_PORT = 'CHECK_CREDENTIALS_PORT';
