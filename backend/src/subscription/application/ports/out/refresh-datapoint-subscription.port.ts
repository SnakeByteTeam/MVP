import { RefreshDatapointSubCmd } from '../../commands/refresh-datapoint-sub.command';

export interface RefreshDatapointSubPort {
  refreshDatapointSub(cmd: RefreshDatapointSubCmd): Promise<boolean>;
}

export const REFRESH_DATAPOINT_SUBSCRIPTION_PORT = Symbol(
  'RefreshDatapointSubPort',
);
