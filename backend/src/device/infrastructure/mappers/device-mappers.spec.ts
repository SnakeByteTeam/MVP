import { Device } from 'src/device/domain/models/device.model';
import { DeviceMapper } from './device-mapper';
import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { DeviceEntity } from '../entities/device.entity';

describe('DeviceMapper', () => {
  let mapper: DeviceMapper;
  let expectedDevice: Device;
  let deviceEntity: DeviceEntity;

  beforeAll(() => {
    mapper = new DeviceMapper();

    expectedDevice = new Device(
      'device-123',
      'plant-01',
      'living-room-light',
      'light',
      'dimmer',
      [
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
      ],
    );

    deviceEntity = {
      id: 'device-123',
      plantId: 'plant-01',
      name: 'living-room-light',
      type: 'light',
      subType: 'dimmer',
      datapoints: [
        {
          id: 'dp-1',
          name: 'brightness',
          readable: true,
          writable: true,
          valueType: 'number',
          enum: ['0', '100'],
          sfeType: 'slider',
        },
        {
          id: 'dp-2',
          name: 'power',
          readable: true,
          writable: true,
          valueType: 'boolean',
          enum: ['on', 'off'],
          sfeType: 'switch',
        },
      ],
    };
  });

  it('should return Device when receive a DeviceEntity', async () => {
    const returnedDevice = mapper.toDomain(deviceEntity);

    expect(returnedDevice).toEqual(expectedDevice);
  });
});
