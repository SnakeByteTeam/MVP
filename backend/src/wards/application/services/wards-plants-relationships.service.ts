import { Injectable } from '@nestjs/common';
import { AddPlantToWardUseCase } from '../ports/in/add-plant-to-ward-use-case.interface';
import { FindAllPlantsByWardIdUseCase } from '../ports/in/find-all-plants-by-ward-id-use-case.interface';
import { RemovePlantFromWardUseCase } from '../ports/in/remove-plant-from-ward-use-case.interface';
import { AddPlantToWardCmd } from '../commands/add-plant-to-ward-cmd';
import { FindAllPlantsByWardIdCmd } from '../commands/find-all-plants-by-ward-id-cmd';
import { RemovePlantFromWardCmd } from '../commands/remove-plant-from-ward-cmd';

@Injectable()
export class WardsPlantsRelationshipsService implements 
    AddPlantToWardUseCase, 
    FindAllPlantsByWardIdUseCase, 
    RemovePlantFromWardUseCase {

    addPlantToWard(req: AddPlantToWardCmd) {
        throw new Error('Method not implemented.');
    }
    findAllPlantsByWardId(req: FindAllPlantsByWardIdCmd) {
        throw new Error('Method not implemented.');
    }
    removePlantFromWard(req: RemovePlantFromWardCmd) {
        throw new Error('Method not implemented.');
    }
}

export const ADD_PLANT_TO_WARD_USE_CASE = 'ADD_PLANT_TO_WARD_USE_CASE';
export const FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE = 'FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE';
export const REMOVE_PLANT_FROM_WARD_USE_CASE = 'REMOVE_PLANT_FROM_WARD_USE_CASE';
