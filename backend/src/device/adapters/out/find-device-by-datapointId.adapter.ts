import { Inject, Injectable } from "@nestjs/common";
import { FindDeviceByDatapointIdCmd } from "src/device/application/commands/find-device-by-datapointId.command";
import { FindDeviceByDatapointIdPort } from "src/device/application/ports/out/find-device-by-datapointId";
import { FIND_DEVICE_BY_DATAPOINTID_REPO_PORT, type FindDeviceByDatapointIdRepoPort } from "src/device/application/repository/find-device-by-datapointId.repository";
import { Device } from "src/device/domain/models/device.model";
import { DeviceEntity } from "src/device/infrastructure/persistence/entities/device.entity";

@Injectable()
export class FindDeviceByDatapointIdAdapter implements FindDeviceByDatapointIdPort {
    constructor(
        @Inject(FIND_DEVICE_BY_DATAPOINTID_REPO_PORT)
        private readonly findByDatapointIdPort: FindDeviceByDatapointIdRepoPort
    ) {}

    async findByDatapointId(cmd: FindDeviceByDatapointIdCmd): Promise<Device> {
        if(!cmd.datapointId) throw new Error('[FIND BY DATAPOINTID ADAPTER] There is no datapointId');

        const entity: DeviceEntity | null = await this.findByDatapointIdPort.findByDatapointId(cmd.datapointId);
        if(!entity) throw new Error(`Can't find device with datapoint ${cmd.datapointId}`);

        return DeviceEntity.toDomain(entity);
    }
}