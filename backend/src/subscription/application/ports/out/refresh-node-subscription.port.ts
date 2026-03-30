import { RefreshNodeSubCmd } from '../../commands/refresh-node-sub.command';

export interface RefreshNodeSubscriptionPort {
  refreshSub(cmd: RefreshNodeSubCmd): Promise<boolean>;
}

export const REFRESH_NODE_SUBSCRIPTION_PORT = Symbol(
  'RefreshNodeSubscriptionPort',
);
