export interface SubscriptionRepositoryPort {
  refreshDatapointSub(validToken: string, plantId: string): Promise<boolean>;
  refreshSub(validToken: string, plantId: string): Promise<boolean>;
}

export const SUBSCRIPTION_REPOSITORY_PORT = Symbol(
  'SubscriptionRepositoryPort',
);
