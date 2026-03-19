import { VimarDevice } from './vimar-device.model';

export interface VimarRoom {
  id: string;
  name: string;
  devices: VimarDevice[];
}
