export interface RefreshDatapointSubRepoPort {
  refreshDatapointSub(validToken: string, plantId: string): Promise<boolean>;
}

export const REFRESH_DATAPOINT_SUBSCRIPTION_REPO_PORT = Symbol(
  'RefreshDatapointSubscriptionRepoPort',
);
