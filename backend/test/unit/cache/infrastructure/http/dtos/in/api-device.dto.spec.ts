import 'reflect-metadata';
import {
  ApiDeviceDto,
  DeviceAttributesDto,
  DeviceMetaDto,
  DeviceResponseDto,
} from 'src/cache/infrastructure/http/dtos/in/api-device.dto';

describe('ApiDeviceDto', () => {
  it('should instantiate with required properties', () => {
    const attributes = new DeviceAttributesDto();
    attributes.title = 'Light Switch';

    const meta = new DeviceMetaDto();
    meta.ssType = 'SS_Light_Switch';
    meta.sfType = 'SF_Light';

    const dto = new ApiDeviceDto();
    dto.id = 'device-1';
    dto.type = 'device';
    dto.attributes = attributes;
    dto.meta = meta;

    expect(dto.id).toBe('device-1');
    expect(dto.type).toBe('device');
    expect(dto.attributes.title).toBe('Light Switch');
    expect(dto.meta.sfType).toBe('SF_Light');
  });

  it('should handle device meta information', () => {
    const meta = new DeviceMetaDto();
    meta.ssType = 'SS_Dimmer';
    meta.sfType = 'SF_Light';

    expect(meta.ssType).toBe('SS_Dimmer');
    expect(meta.sfType).toBe('SF_Light');
  });

  it('should handle multiple devices in response', () => {
    const device1 = new ApiDeviceDto();
    device1.id = 'device-1';
    device1.type = 'device';

    const device2 = new ApiDeviceDto();
    device2.id = 'device-2';
    device2.type = 'device';

    const response = new DeviceResponseDto();
    response.data = [device1, device2];

    expect(response.data).toHaveLength(2);
    expect(response.data[0].id).toBe('device-1');
    expect(response.data[1].id).toBe('device-2');
  });

  it('should handle empty device list', () => {
    const response = new DeviceResponseDto();
    response.data = [];

    expect(response.data).toEqual([]);
    expect(response.data).toHaveLength(0);
  });

  it('should handle various device types', () => {
    const devices = ['Light', 'Climate', 'Outlet', 'Blinds', 'Lock'];

    devices.forEach((type) => {
      const attributes = new DeviceAttributesDto();
      attributes.title = type;

      const meta = new DeviceMetaDto();
      meta.sfType = `SF_${type}`;

      const dto = new ApiDeviceDto();
      dto.attributes = attributes;
      dto.meta = meta;

      expect(dto.attributes.title).toBe(type);
      expect(dto.meta.sfType).toBe(`SF_${type}`);
    });
  });
});
