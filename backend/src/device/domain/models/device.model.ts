import { Datapoint } from "./datapoint.model";

export class Device {
    private id: string;
    private plantId: string;
    private name: string;
    private type: string;
    private subType: string;
    private datapoints: Datapoint[];

    constructor(
        id: string, 
        plantId: string,
        name: string, 
        type: string,
        subType: string,
        datapoints: Datapoint[])
    {
        this.id = id;
        this.plantId = plantId;
        this.name = name;
        this.type = type;
        this.subType = subType;
        this.datapoints = [...datapoints]; 
    }

    getId(): string{
        return this.id;
    }

    getPlantId(): string{
        return this.plantId;
    }

    getName(): string{
        return this.name;
    }

    getType(): string{
        return this.type;
    }

    getSubType(): string{
        return this.subType;
    }

    getDatapoints(): Datapoint[]{
        return [...this.datapoints];
    }
}