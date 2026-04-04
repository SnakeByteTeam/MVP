export interface RefreshDatapointSubUseCase {
  refreshDatapointSub(): Promise<boolean>;
}

export const REFRESH_DATAPOINT_SUBSCRIPTION_USECASE = Symbol(
  'RefreshDatapointSubUseCase',
);
