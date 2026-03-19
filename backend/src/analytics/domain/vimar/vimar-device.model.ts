import { VimarDatapoint } from './vimar-datapoint.model';

export interface VimarDevice {
  id: string;
  name: string;
  type: string;
  subType: string;
  datapoints: VimarDatapoint[];
}
