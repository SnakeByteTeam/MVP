import { VimarRoom } from './vimar-room.model';

export interface VimarStructure {
  id: string;
  name: string;
  rooms: VimarRoom[];
}
