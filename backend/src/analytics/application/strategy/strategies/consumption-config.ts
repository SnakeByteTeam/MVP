import { DatapointValue } from 'src/analytics/domain/datapoint-value.model';

export const DEVICE_WATT: Record<string, number> = {
  SF_Light: 10,
};

export const ANOMALY_THRESHOLD_WH = DEVICE_WATT.SF_Light * 6.5 * 1.5;

export function isDeviceActive(dp: DatapointValue): boolean {
  return dp.sfeType === 'SFE_State_OnOff' && dp.value === 'On';
}

export function getDeviceWatt(deviceType: string): number {
  return DEVICE_WATT[deviceType] ?? 0;
}
