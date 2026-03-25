import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { Device } from 'src/device/domain/models/device.model';
import { DatapointDto } from 'src/device/infrastructure/dtos/datapoint.dto';
import { DeviceDto } from 'src/device/infrastructure/dtos/device.dto';
import { Plant } from 'src/plant/domain/models/plant.model';
import { Room } from 'src/plant/domain/models/room.model';
import { RoomDto } from './room.dto';
import { PlantDto } from './plant.dto';

describe('PlantDto', () => {
  it('should map to domain with nested children and cached_at', () => {
    const cachedAt = new Date('2026-03-24T12:00:00.000Z');

    const dpDto = new DatapointDto();
    dpDto.id = 'dp-1';
    dpDto.name = 'brightness';
    dpDto.readable = true;
    dpDto.writable = true;
    dpDto.valueType = 'number';
    dpDto.enum = ['0', '100'];
    dpDto.sfeType = 'slider';

    const deviceDto = new DeviceDto();
    deviceDto.id = 'dev-1';
    deviceDto.name = 'Lamp';
    deviceDto.plantId = 'plant-1';
    deviceDto.type = 'light';
    deviceDto.subType = 'dimmer';
    deviceDto.datapoints = [dpDto];

    const roomDto = new RoomDto();
    roomDto.id = 'room-1';
    roomDto.name = 'Living Room';
    roomDto.devices = [deviceDto];

    const dto = new PlantDto();
    dto.id = 'plant-1';
    dto.name = 'My Plant';
    dto.rooms = [roomDto];
    dto.cached_at = cachedAt;

    const plant = PlantDto.toDomain(dto);

    expect(plant).toBeInstanceOf(Plant);
    expect(plant.getId()).toBe('plant-1');
    expect(plant.getName()).toBe('My Plant');
    expect(plant.getCachedAt().toISOString()).toBe(cachedAt.toISOString());
    expect(plant.getRooms()).toHaveLength(1);
    expect(plant.getRooms()[0].getDevices()).toHaveLength(1);
    expect(plant.getRooms()[0].getDevices()[0].getDatapoints()).toHaveLength(1);
  });

  it('should map from domain with nested children and cached_at', () => {
    const cachedAt = new Date('2026-03-24T12:00:00.000Z');
    const datapoints: Datapoint[] = [
      new Datapoint('dp-1', 'brightness', true, true, 'number', ['0', '100'], 'slider'),
    ];
    const devices: Device[] = [
      new Device('dev-1', 'plant-1', 'Lamp', 'light', 'dimmer', datapoints),
    ];
    const rooms: Room[] = [new Room('room-1', 'Living Room', devices)];
    const plant = new Plant('plant-1', 'My Plant', rooms, cachedAt);

    const dto = PlantDto.fromDomain(plant);

    expect(dto.id).toBe('plant-1');
    expect(dto.name).toBe('My Plant');
    expect(dto.cached_at.toISOString()).toBe(cachedAt.toISOString());
    expect(dto.rooms).toHaveLength(1);
    expect(dto.rooms[0].devices).toHaveLength(1);
    expect(dto.rooms[0].devices[0].datapoints).toHaveLength(1);
  });
});
