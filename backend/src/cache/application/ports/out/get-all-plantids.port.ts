export interface GetAllPlantIdsPort {
  getAllPlantIds(): Promise<string[]>;
}

export const GET_ALL_PLANTIDS_PORT = Symbol('GetAllPlantIdsPort');
