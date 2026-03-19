import { Inject } from "@nestjs/common";
import { DeleteUserCmd } from "../../application/commands/delete-user-cmd";
import { DeleteUserPort } from "../../application/ports/out/delete-user-port.interface";
import { DELETE_USER_REPOSITORY, DeleteUserRepository } from "../../application/repository/delete-user-repository.interface";

export class DeleteUserAdapter implements DeleteUserPort {

    constructor(
        @Inject(DELETE_USER_REPOSITORY) private readonly deleteUserRepository: DeleteUserRepository
    ){}

    deleteUser(req: DeleteUserCmd): void {
        return this.deleteUserRepository.DeleteUserAdapter(
            req.id
        );
    }
}
