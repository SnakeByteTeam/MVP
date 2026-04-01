import { Inject, Injectable } from '@nestjs/common';
import { IngestTimeseriesCmd } from 'src/device/application/commands/ingest-timeseries.command';
import { IngestTimeseriesPort } from 'src/device/application/ports/out/ingest-timeseries.port';
import {
  INGEST_TIMESERIES_REPO_PORT,
  type IngestTimeseriesRepoPort,
} from 'src/device/application/repository/ingest-timeseries.repository';

@Injectable()
export class IngestTimeseriesAdapter implements IngestTimeseriesPort {
  constructor(
    @Inject(INGEST_TIMESERIES_REPO_PORT)
    private readonly ingestRepoPort: IngestTimeseriesRepoPort,
  ) {}
  async ingestTimeseries(cmd: IngestTimeseriesCmd): Promise<void> {
    if (!cmd?.datapointId || !cmd?.value || !cmd?.timestamp)
      throw new Error("Can't ingest timeseries without parameters");

    const result: boolean = 
      await this.ingestRepoPort.ingestTimeseries(
          cmd.datapointId,
          cmd.value,
          cmd.timestamp,
        );
   
    if(!result) throw new Error(`Error ingesting timeseries of ${cmd.datapointId}`);
  }
}
