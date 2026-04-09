import { RefreshAllSubCmd } from '../../commands/refresh-all-sub.command';

export interface RefreshAllSubscriptionUseCase {
  refreshAllSubscription(cmd: RefreshAllSubCmd): Promise<boolean>;
}

export const REFRESH_ALL_SUBSCRIPTION_USECASE = Symbol(
  'RefreshAllSubscriptionUseCase',
);
