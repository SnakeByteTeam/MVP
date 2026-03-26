import { Room } from '../../../plant/domain/models/room.model';

export class Plant {
  private readonly id: string;
  private readonly name: string;
  private readonly rooms: Room[];
  private readonly cached_at: Date;

  constructor(
    id: string,
    name: string,
    rooms: Room[],
    cached_at: Date = new Date(),
  ) {
    this.id = id;
    this.name = name;
    this.rooms = [...rooms];
    this.cached_at = cached_at;
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

  getCachedAt(): Date {
    return new Date(this.cached_at);
  }
}
