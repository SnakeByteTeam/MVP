import { Room } from '../../../plant/domain/models/room.model';

export class Plant {
  private readonly id: string;
  private readonly name: string;
  private readonly rooms?: Room[];
  private readonly wardId?: number;

  constructor(id: string, name: string, rooms?: Room[], wardId?: number) {
    this.id = id;
    this.name = name;
    if(rooms) this.rooms = [...rooms];
    this.wardId = wardId;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getRooms(): Room[] | null {
    if(this.rooms) return [...this.rooms];
    return null
  }

  getWardId(): number | null {
    if(this.wardId) return this.wardId;
    return null;
  }
}
