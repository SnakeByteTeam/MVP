import { Device } from "src/device/domain/models/device.model";
import { DatapointEntity } from "./datapoint.entity";

export class DeviceEntity {
    id: string;
    name: string;
    plantId: string;
    type: string;
    subType: string;
    datapoints: DatapointEntity[];

    static toDomain(entity: DeviceEntity): Device {
        const datapoints = entity.datapoints.map((datapoint) => DatapointEntity.toDomain(datapoint));
        return new Device(
            entity.id,
            entity.plantId,
            entity.name,
            entity.type,
            entity.subType,
            datapoints,
        );
    }

    static fromDomain(device: Device): DeviceEntity {
        const entity = new DeviceEntity();
        entity.id = device.getId();
        entity.name = device.getName();
        entity.plantId = device.getPlantId();
        entity.type = device.getType();
        entity.subType = device.getSubType();
        entity.datapoints = device.getDatapoints().map((datapoint) => DatapointEntity.fromDomain(datapoint));
        return entity;
    }
}