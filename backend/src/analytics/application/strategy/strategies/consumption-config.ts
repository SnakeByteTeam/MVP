import { VimarDatapoint } from 'src/analytics/domain/vimar/vimar-datapoint.model';
import { VimarDevice } from 'src/analytics/domain/vimar/vimar-device.model';

export const DEVICE_WATT: Record<string, number> = {
  SF_Light: 10, // watt medi luci
  SF_Thermostat: 1000, // più fan coil stimato (media riscaldamento/raffreddamento)
};

export function isDeviceActive(device: VimarDevice): boolean {
  for (const dp of device.datapoints) {
    if (dp.sfeType === 'SFE_State_OnOff' && dp.value === 'On') return true;
    if (dp.sfeType === 'SFE_State_HVACMode' && dp.value !== 'Off') return true;
  }
  return false;
}

export function getDeviceWatt(device: VimarDevice): number {
  if (device.type === 'SF_Thermostat') {
    const hvacDp = device.datapoints.find(
      (dp: VimarDatapoint) => dp.sfeType === 'SFE_State_HVACMode',
    );

    switch (hvacDp?.value) {
      case 'Heating':
        return 1000;
      case 'Cooling':
        return 800;
      case 'Auto':
        return 900;
      default:
        return 0;
    }
  }

  return DEVICE_WATT[device.type] ?? 0;
}
