import { Room } from "../../../plant/domain/models/room.model";

export class Plant {
    private readonly id: string; 
    private readonly name: string;
    private readonly rooms: Room[];

    constructor(id: string, name: string, rooms: Room[]) {
        this.id = id; 
        this.name = name; 
        this.rooms = [...rooms];
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getRooms(): Room[] {
        return [...this.rooms];
    }
}
