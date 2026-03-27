import { Room } from '../../../plant/domain/models/room.model';

export class Plant {
  private readonly id: string;
  private readonly name: string;
  private readonly rooms: Room[];
  private readonly wardId: number;

  constructor(id: string, name: string, rooms: Room[], wardId: number) {
    this.id = id;
    this.name = name;
    this.rooms = [...rooms];
    this.wardId = wardId;
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

  getWardId(): number {
    return this.wardId;
  }
}
