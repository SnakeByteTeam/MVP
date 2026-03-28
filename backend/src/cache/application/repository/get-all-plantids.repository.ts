export interface GetAllPlantIdsRepoPort {
    getAllPlantIds(validToken: string): Promise<string[]>;
}

export const GET_ALL_PLANTIDS_REPO_PORT = Symbol('GetAllPlantIdsRepoPort');