import { Device } from "../../../device/domain/models/device.model";

export class Room {
    private readonly id: string;
    private readonly name: string;
    private readonly devices: Device[];
    
    constructor(id: string, name: string, devices: Device[]) {
        this.id = id;
        this.name = name; 
        this.devices = [...devices];
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getDevices(): Device[] {
        return [...this.devices];
    }
}