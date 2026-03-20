import { VimarDevice } from 'src/analytics/domain/vimar/vimar-device.model';

export const DEVICE_WATT: Record<string, number> = {
  SF_Light: 10, // watt medi luci
};

const NORMAL_DAILY_LIGHT_WH = DEVICE_WATT.SF_Light * 6.5; // 6.5 ore in media
export const ANOMALY_THRESHOLD_WH = NORMAL_DAILY_LIGHT_WH * 1.5; // 50% in più

export function isDeviceActive(device: VimarDevice): boolean {
  for (const dp of device.datapoints) {
    if (dp.sfeType === 'SFE_State_OnOff' && dp.value === 'On') return true;
  }
  return false;
}

export function getDeviceWatt(device: VimarDevice): number {
  return DEVICE_WATT[device.type] ?? 0;
}
