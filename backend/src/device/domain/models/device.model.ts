import { Datapoint } from "./datapoint.model";

export class Device {
    private readonly id: string;
    private readonly plantId: string;
    private readonly name: string;
    private readonly type: string;
    private readonly subType: string;
    private readonly datapoints: Datapoint[];

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