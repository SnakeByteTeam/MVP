export interface UpdateCacheAllPlantsUseCase {
    updateAllCache(): Promise<boolean>;
}

export const UPDATE_CACHE_ALL_PLANTS_USECASE = Symbol('UpdateCacheAllPlantsUseCase');