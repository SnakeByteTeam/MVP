export interface CreateWardDto {
    name: string;
}

export interface UpdateWardDto {
    name: string;
}

export interface AssignOperatorDto {
    userId: number;
}

export interface AssignPlantDto {
    plantId: string;
}

export interface WardUserDto {
    id: number;
    username: string;
}

//riferito a reparto
export interface WardPlantDto {
    id: string;
    name: string;
}

export interface WardSummaryDto {
    id: number;
    name: string;
}
