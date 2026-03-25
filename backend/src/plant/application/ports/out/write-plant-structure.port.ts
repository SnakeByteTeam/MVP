import { Plant } from "src/plant/domain/models/plant.model";

export interface WritePlantStructurePort {
    writeStructure(plant: Plant): Promise<boolean>;
}

export const WRITE_STRUCTURE_PORT = Symbol('WriteStructurePort');