import { DatapointValue, DeviceValue } from 'src/device/domain/models/device-value.model';

describe('DeviceValue', () => {
  it('should expose constructor values through getters', () => {
    const values = [new DatapointValue('dp-1', 'Power', 'On')];
    const deviceValue = new DeviceValue('device-1', values);

    expect(deviceValue.getDeviceId()).toBe('device-1');
    expect(deviceValue.getValues()).toHaveLength(1);
    expect(deviceValue.getValues()[0].getDatapointId()).toBe('dp-1');
  });

  it('should return a defensive copy of values array', () => {
    const values = [new DatapointValue('dp-1', 'Power', 'On')];
    const deviceValue = new DeviceValue('device-1', values);

    const extracted = deviceValue.getValues();
    extracted.push(new DatapointValue('dp-2', 'Brightness', 80));

    expect(deviceValue.getValues()).toHaveLength(1);
  });
});

describe('DatapointValue', () => {
  it('should expose datapoint id, name and value through getters', () => {
    const dp = new DatapointValue('dp-1', 'Power', 'On');

    expect(dp.getDatapointId()).toBe('dp-1');
    expect(dp.getName()).toBe('Power');
    expect(dp.getValue()).toBe('On');
  });

  it('should support numeric values', () => {
    const dp = new DatapointValue('dp-2', 'Brightness', 55);

    expect(dp.getValue()).toBe(55);
  });
});
