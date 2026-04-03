import { DatapointValue, DeviceValue } from 'src/device/domain/models/device-value.model';
import { DatapointValueDto, DeviceValueDto } from './device-value.dto';

describe('DatapointValueDto', () => {
  it('should map domain to dto and dto to domain', () => {
    const domain = new DatapointValue('dp-1', 'Power', 'On');

    const dto = DatapointValueDto.fromDomain(domain);
    const roundTrip = DatapointValueDto.toDomain(dto);

    expect(dto).toEqual({
      datapointId: 'dp-1',
      name: 'Power',
      value: 'On',
    });
    expect(roundTrip.getDatapointId()).toBe('dp-1');
    expect(roundTrip.getName()).toBe('Power');
    expect(roundTrip.getValue()).toBe('On');
  });
});

describe('DeviceValueDto', () => {
  it('should map domain to dto', () => {
    const domain = new DeviceValue('device-1', [
      new DatapointValue('dp-1', 'Power', 'On'),
      new DatapointValue('dp-2', 'Brightness', 70),
    ]);

    const dto = DeviceValueDto.fromDomain(domain);

    expect(dto.deviceId).toBe('device-1');
    expect(dto.values).toHaveLength(2);
    expect(dto.values[1].value).toBe(70);
  });

  it('should map dto to domain', () => {
    const dto = new DeviceValueDto();
    dto.deviceId = 'device-1';
    dto.values = [
      { datapointId: 'dp-1', name: 'Power', value: 'On' } as DatapointValueDto,
      {
        datapointId: 'dp-2',
        name: 'Brightness',
        value: 70,
      } as DatapointValueDto,
    ];

    const domain = DeviceValueDto.toDomain(dto);

    expect(domain.getDeviceId()).toBe('device-1');
    expect(domain.getValues()).toHaveLength(2);
    expect(domain.getValues()[0].getName()).toBe('Power');
  });
});
