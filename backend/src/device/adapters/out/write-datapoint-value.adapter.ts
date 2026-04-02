import { Inject, Injectable } from "@nestjs/common";
import { GETVALIDTOKENPORT, type GetValidTokenPort } from "src/api-auth-vimar/application/ports/out/get-valid-token.port";
import { WriteDatapointValueCmd } from "src/device/application/commands/write-datapoint-value.command";
import { WriteDatapointValuePort } from "src/device/application/ports/out/write-device-value.port";
import { WRITE_DATAPOINT_VALUE_REPO_PORT, type WriteDatapointValueRepoPort } from "src/device/application/repository/write-datapoint-value.repo";

@Injectable()
export class WriteDatapointValueAdapter implements WriteDatapointValuePort {
    constructor(
        @Inject(WRITE_DATAPOINT_VALUE_REPO_PORT)
        private readonly writeDatapointRepoPort: WriteDatapointValueRepoPort,
        @Inject(GETVALIDTOKENPORT)
        private readonly tokenPort: GetValidTokenPort
    ) {}

    async writeDatapointValue(cmd: WriteDatapointValueCmd): Promise<void> {
        const token: string | null = await this.tokenPort.getValidToken();
        if(!token) throw new Error('[WRITE DATAPOINT ADAPTER] Token is null');

        const result: boolean = await this.writeDatapointRepoPort.writeDeviceValue(token, cmd.datapointId, cmd.value);
        if(!result) throw Error('Bad Request');
    }
}