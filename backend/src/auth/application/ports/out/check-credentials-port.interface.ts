import { CheckCredentialsCmd } from "../../commands/check-credentials-cmd";

export interface CheckCredentialsPort {
    checkCredentials(req: CheckCredentialsCmd);
}
