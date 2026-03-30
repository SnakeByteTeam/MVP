export interface RefreshNodeSubscriptionRepoPort {
  refreshSub(validToken: string, plantId: string): Promise<boolean>;
}

export const REFRESH_NODE_SUBSCRIPTION_REPO_PORT = Symbol(
  'RefreshNodeSubscriptionRepoPort',
);
