import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { Device } from 'src/device/domain/models/device.model';

describe('Device', () => {
  it('should correctly return all attributes', () => {
    const datapoints: Datapoint[] = [
      new Datapoint(
        'dp-1',
        'brightness',
        true,
        true,
        'number',
        ['0', '100'],
        'slider',
      ),
    ];

    const device = new Device(
      'device-123',
      'plant-01',
      'living-room-light',
      'light',
      'dimmer',
      datapoints,
    );

    expect(device.getId()).toBe('device-123');
    expect(device.getPlantId()).toBe('plant-01');
    expect(device.getName()).toBe('living-room-light');
    expect(device.getType()).toBe('light');
    expect(device.getSubType()).toBe('dimmer');
  });

  it('should return correctly the content of the datapoints array', () => {
    const datapoints: Datapoint[] = [
      new Datapoint(
        'dp-1',
        'brightness',
        true,
        true,
        'number',
        ['0', '100'],
        'slider',
      ),
      new Datapoint(
        'dp-2',
        'power',
        true,
        true,
        'boolean',
        ['on', 'off'],
        'switch',
      ),
    ];

    const device = new Device(
      'device-123',
      'plant-01',
      'living-room-light',
      'light',
      'dimmer',
      datapoints,
    );

    expect(device.getDatapoints()).toEqual(datapoints);
    expect(device.getDatapoints()).toHaveLength(2);
  });

  it('should use defensive copy for constructor input and getter output', () => {
    const originalDatapoints: Datapoint[] = [
      new Datapoint(
        'dp-1',
        'brightness',
        true,
        true,
        'number',
        ['0', '100'],
        'slider',
      ),
    ];

    const device = new Device(
      'device-123',
      'plant-01',
      'living-room-light',
      'light',
      'dimmer',
      originalDatapoints,
    );

    originalDatapoints.push(
      new Datapoint(
        'dp-2',
        'power',
        true,
        true,
        'boolean',
        ['on', 'off'],
        'switch',
      ),
    ); //now has length = 2

    expect(device.getDatapoints()).toHaveLength(1);

    const getterResult = device.getDatapoints();
    getterResult.push(
      new Datapoint(
        'dp-3',
        'mode',
        true,
        true,
        'string',
        ['auto', 'manual'],
        'select',
      ),
    ); //now has length = 2

    expect(device.getDatapoints()).toHaveLength(1);
  });
});
