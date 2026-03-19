import { Inject } from "@nestjs/common";
import { DeleteWardCmd } from "../../application/commands/delete-ward-cmd";
import { DeleteWardPort } from "../../application/ports/out/delete-ward-port.interface";
import { DELETE_WARD_REPOSITORY } from "../../application/repository/delete-ward-repository.interface";

export class DeleteWardAdapter implements DeleteWardPort{
    
    constructor(
        @Inject(DELETE_WARD_REPOSITORY) private readonly deleteWardRepository
    ){}

    deleteWard(req: DeleteWardCmd): void {
        return this.deleteWardRepository.deleteWard(req.id);
    }
}
