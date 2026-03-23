import { DatapointEntity } from "./datapoint.entity";

export interface DeviceEntity {
    id: string, 
    name: string, 
    plantId: string,
    type: string, 
    subType: string, 
    datapoints: DatapointEntity[]
}