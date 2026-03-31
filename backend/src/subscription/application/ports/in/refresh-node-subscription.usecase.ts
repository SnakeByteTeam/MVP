
export interface RefreshNodeSubUseCase {
  refreshSub(): Promise<boolean>;
}

export const REFRESH_NODE_SUBSCRIPTION_USECASE = Symbol(
  'RefreshNodeSubUseCase',
);
