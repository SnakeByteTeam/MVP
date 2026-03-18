import { Ward } from "../../domain/ward";
import { CreateWardCmd } from "../commands/create-ward-cmd";
import { FindAllPlantsByWardIdCmd } from "../commands/find-all-plants-by-ward-id-cmd";
import { FindAllUsersByWardIdCmd } from "../commands/find-all-users-by-ward-id-cmd";
import { UpdateWardCmd } from "../commands/update-ward-cmd";
import { DeleteWardCmd } from "../commands/delete-ward-cmd";
import { CreateWardUseCase } from "../ports/in/create-ward-use-case.interface";
import { DeleteWardUseCase } from "../ports/in/delete-ward-use-case.interface";
import { FindAllPlantsByWardIdUseCase } from "../ports/in/find-all-plants-by-ward-id-use-case.interface";
import { FindAllUsersByWardIdUseCase } from "../ports/in/find-all-users-by-ward-id-use-case.interface";
import { FindAllWardsUseCase } from "../ports/in/find-all-wards-use-case.interface";
import { UpdateWardUseCase } from "../ports/in/update-ward-use-case.interface";

export class WardService implements 
    CreateWardUseCase, 
    FindAllWardsUseCase,
    FindAllPlantsByWardIdUseCase, 
    FindAllUsersByWardIdUseCase,
    UpdateWardUseCase,
    DeleteWardUseCase {
    createWard(req: CreateWardCmd): Ward {
        throw new Error("Method not implemented.");
    }
    findAllWard(): Ward[] {
        throw new Error("Method not implemented.");
    }
    findAllPlantsByWardId(req: FindAllPlantsByWardIdCmd) {
        throw new Error("Method not implemented.");
    }
    findAllUsersByWardId(req: FindAllUsersByWardIdCmd): Ward {
        throw new Error("Method not implemented.");
    }
    updateWard(req: UpdateWardCmd): Ward {
        throw new Error("Method not implemented.");
    }
    deleteWard(req: DeleteWardCmd): void {
        throw new Error("Method not implemented.");
    }
}

export const CREATE_WARD_USE_CASE = 'CREATE_WARD_USE_CASE';
export const FIND_ALL_WARD_USE_CASE = 'FIND_ALL_WARD_USE_CASE';
export const FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE = 'FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE';
export const FIND_ALL_USERS_BY_WARD_ID_USE_CASE = 'FIND_ALL_USERS_BY_WARD_ID_USE_CASE';
export const UPDATE_WARD_USE_CASE = 'UPDATE_WARD_USE_CASE';
export const DELETE_WARD_USE_CASE = 'DELETE_WARD_USE_CASE';
