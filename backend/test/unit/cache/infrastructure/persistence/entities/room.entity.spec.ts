import { Device } from 'src/device/domain/models/device.model';
import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { Room } from 'src/plant/domain/models/room.model';
import { RoomEntity } from 'src/cache/infrastructure/persistence/entities/room.entity';
import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';
import { DatapointEntity } from 'src/device/infrastructure/persistence/entities/datapoint.entity';

describe('RoomEntity', () => {
  it('toDomain converte entity in domain Room', () => {
    const datapointEntity = new DatapointEntity();
    datapointEntity.id = 'dp-1';
    datapointEntity.name = 'Power';
    datapointEntity.readable = true;
    datapointEntity.writable = true;
    datapointEntity.valueType = 'boolean';
    datapointEntity.enum = ['On', 'Off'];
    datapointEntity.sfeType = 'SFE_Cmd_OnOff';

    const deviceEntity = new DeviceEntity();
    deviceEntity.id = 'dev-1';
    deviceEntity.name = 'Luce';
    deviceEntity.plantId = 'plant-1';
    deviceEntity.type = 'SF_Light';
    deviceEntity.subType = 'SS_Light';
    deviceEntity.datapoints = [datapointEntity];

    const roomEntity = new RoomEntity();
    roomEntity.id = 'room-1';
    roomEntity.name = 'Soggiorno';
    roomEntity.devices = [deviceEntity];

    const room = RoomEntity.toDomain(roomEntity);

    expect(room).toBeInstanceOf(Room);
    expect(room.getId()).toBe('room-1');
    expect(room.getName()).toBe('Soggiorno');
    expect(room.getDevices()).toHaveLength(1);
    expect(room.getDevices()[0].getId()).toBe('dev-1');
  });

  it('fromDomain converte domain Room in entity', () => {
    const datapoint = new Datapoint(
      'dp-1',
      'Power',
      true,
      true,
      'boolean',
      ['On', 'Off'],
      'SFE_Cmd_OnOff',
    );
    const device = new Device(
      'dev-1',
      'plant-1',
      'Luce',
      'SF_Light',
      'SS_Light',
      [datapoint],
    );
    const room = new Room('room-1', 'Soggiorno', [device]);

    const entity = RoomEntity.fromDomain(room);

    expect(entity.id).toBe('room-1');
    expect(entity.name).toBe('Soggiorno');
    expect(entity.devices).toHaveLength(1);
    expect(entity.devices[0].id).toBe('dev-1');
  });
});
