import { Inject } from "@nestjs/common";
import { ChangeCredentialsPort } from "../../application/ports/out/change-credentials-port.interface";
import { ChangeCredentialsCmd } from "../../application/commands/change-credentials-cmd";
import { ChangeCredentialsRepository } from "../../application/repository/change-credentials-repository.interface";

export class ChangeCredentialsAdapter implements ChangeCredentialsPort {

    constructor(
        @Inject('CHANGE_CREDENTIALS_REPOSITORY') private readonly changeCredentialsRepository: ChangeCredentialsRepository,
    ){}

    changeCredentials(req: ChangeCredentialsCmd): Promise<void> {
        return this.changeCredentialsRepository.changeCredentials(req.username, req.newPassword, req.firstAccess);
    }

}

export const CHANGE_CREDENTIALS_PORT = 'CHANGE_CREDENTIALS_PORT';
