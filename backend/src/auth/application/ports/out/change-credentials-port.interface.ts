import { ChangeCredentialsCmd } from "../../commands/change-credentials-cmd";

export interface ChangeCredentialsPort {
    changeCredentials(req: ChangeCredentialsCmd): Promise<void>;
}