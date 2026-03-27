export interface CreateWardDto {
    name: string;
}

export interface UpdateWardDto {
    name: string;
}

export interface AssignOperatorDto {
    userId: number;
    //vedere dto backend
}

export interface AssignPlantDto {
    plantId: number;
}

export interface WardUserDto {
    id: number;
    username: string;
}

export interface WardPlantDto {
    id: number;
    name: string;
}

export interface WardSummaryDto {
    id: number;
    name: string;
}
